document.addEventListener('DOMContentLoaded', () => {
  // Get all DOM elements
  const imageGenSection = document.getElementById('imageGenSection');
  const reviewSection = document.getElementById('reviewSection');
  const imageGenTab = document.getElementById('imageGenTab');
  const reviewTab = document.getElementById('reviewTab');
  
  // Image Generation elements
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('promptInput');
  const imageContainer = document.getElementById('imageContainer');
  const loading = document.getElementById('loading');
  const buttons = document.getElementById('buttons');

  // Review elements
  const reviewBtn = document.getElementById('reviewBtn');
  const reviewInput = document.getElementById('reviewInput');
  const reviewLoading = document.getElementById('reviewLoading');
  const reviewResult = document.getElementById('reviewResult');
  const reviewContent = document.getElementById('reviewContent');
  const copyReview = document.getElementById('copyReview');

  // Add model selector element
  const modelSelector = document.getElementById('modelSelector');

  // Tab switching functionality
  function switchTab(tab) {
    if (tab === 'image') {
      imageGenSection.classList.remove('hidden');
      reviewSection.classList.add('hidden');
      imageGenTab.classList.add('bg-accent', 'text-accent-foreground');
      reviewTab.classList.remove('bg-accent', 'text-accent-foreground');
    } else {
      imageGenSection.classList.add('hidden');
      reviewSection.classList.remove('hidden');
      imageGenTab.classList.remove('bg-accent', 'text-accent-foreground');
      reviewTab.classList.add('bg-accent', 'text-accent-foreground');
    }
  }

  imageGenTab.addEventListener('click', () => switchTab('image'));
  reviewTab.addEventListener('click', () => switchTab('review'));

  // Function to trigger image generation
  async function generateImage(prompt) {
    if (!prompt) return;

    loading.classList.remove('hidden');
    imageContainer.innerHTML = '';
    buttons.classList.add('hidden');
    generateBtn.disabled = true;

    try {
      const response = await fetch('https://api.studio.nebius.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': 'Bearer <your API key>'
        },
        body: JSON.stringify({
          width: 512,
          height: 512,
          num_inference_steps: 4,
          negative_prompt: "",
          seed: -1,
          response_extension: "jpg",
          response_format: "url",
          prompt: prompt,
          model: "black-forest-labs/flux-schnell"
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const imageUrl = data.data[0].url;

      chrome.storage.local.set({
        generatedImage: imageUrl,
        generatedText: prompt,
        error: null
      });

      const img = document.createElement('img');
      img.src = imageUrl;
      img.className = 'w-full h-auto rounded-md';
      imageContainer.appendChild(img);
      buttons.classList.remove('hidden');

    } catch (error) {
      console.error('Error:', error);
      imageContainer.innerHTML = `
        <div class="text-red-500 p-4 text-center">
          Error: Failed to generate image. ${error.message}
        </div>`;
    } finally {
      loading.classList.add('hidden');
      generateBtn.disabled = false;
    }
  }

  // Function to trigger text review with streaming
  async function generateReview(text) {
    if (!text) return;

    reviewLoading.classList.remove('hidden');
    reviewResult.classList.remove('hidden');
    reviewContent.textContent = ''; // Clear previous content
    reviewBtn.disabled = true;

    try {
      const selectedModel = modelSelector.value; // Get selected model
      const response = await fetch('https://api.studio.nebius.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': 'Bearer <your API key>'
        },
        body: JSON.stringify({
          model: selectedModel, // Use selected model
          max_tokens: 53389,
          temperature: 0.3,
          top_p: 0.95,
          top_k: 50,
          stream: true,
          messages: [
            {
              role: "system",
              content: "You are a professional technical blog post reviewer. From the selected text, understand the content, and give suggestions on improving the content and also point out any technical issues in the content by giving appropriate suggestions based on the content of the blog post."
            },
            {
              role: "user",
              content: [{ type: "text", text: text }]
            }
          ]
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete messages from buffer
        while (buffer.includes('\n')) {
          const newlineIndex = buffer.indexOf('\n');
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                // Add new content with typing effect
                reviewContent.textContent += content;
                // Auto-scroll to bottom
                reviewContent.scrollTop = reviewContent.scrollHeight;
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      reviewContent.innerHTML = `
        <div class="text-red-500">
          Error: Failed to generate review. ${error.message}
        </div>`;
    } finally {
      reviewLoading.classList.add('hidden');
      reviewBtn.disabled = false;
    }
  }

  // Store user's model preference
  modelSelector.addEventListener('change', () => {
    chrome.storage.local.set({ preferredModel: modelSelector.value });
  });

  // Check for stored data and current tool
  chrome.storage.local.get([
    'generatedImage', 
    'generatedText', 
    'reviewText', 
    'currentTool', 
    'autoStart',
    'preferredModel' // Add preferred model to storage check
  ], (result) => {
    // Set model selector to stored preference or default
    if (result.preferredModel) {
      modelSelector.value = result.preferredModel;
    }

    // Handle image generation data
    if (result.generatedImage) {
      const img = document.createElement('img');
      img.src = result.generatedImage;
      img.className = 'w-full h-auto rounded-md';
      imageContainer.appendChild(img);
      buttons.classList.remove('hidden');
      if (result.generatedText) {
        promptInput.value = result.generatedText;
      }
    }

    // Handle review text
    if (result.reviewText) {
      reviewInput.value = result.reviewText;
    }

    // Switch to appropriate tab
    if (result.currentTool) {
      switchTab(result.currentTool);
    }

    // Auto-start if coming from context menu
    if (result.autoStart) {
      if (result.currentTool === 'image' && result.generatedText) {
        generateImage(result.generatedText);
      } else if (result.currentTool === 'review' && result.reviewText) {
        generateReview(result.reviewText);
      }
      // Clear the auto-start flag
      chrome.storage.local.remove('autoStart');
    }
  });

  // Event listeners for manual triggers
  generateBtn.addEventListener('click', () => generateImage(promptInput.value.trim()));
  reviewBtn.addEventListener('click', () => generateReview(reviewInput.value.trim()));

  // Copy review functionality
  copyReview.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(reviewContent.textContent);
      alert('Review copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy review. Please try again.');
    }
  });
}); 