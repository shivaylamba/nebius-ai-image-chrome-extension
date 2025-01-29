document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const promptInput = document.getElementById('promptInput');
  const imageContainer = document.getElementById('imageContainer');
  const loading = document.getElementById('loading');
  const buttons = document.getElementById('buttons');

  // Check for any stored image on load
  chrome.storage.local.get(['generatedImage', 'generatedText'], (result) => {
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
  });

  generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    // Show loading state
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
          'Authorization': 'Bearer <add api token here>'
        },
        mode: 'cors',
        credentials: 'omit',
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Store the generated image and prompt
      chrome.storage.local.set({
        generatedImage: imageUrl,
        generatedText: prompt,
        error: null
      });

      // Display the image
      const img = document.createElement('img');
      img.src = imageUrl;
      img.className = 'w-full h-auto rounded-md';
      imageContainer.appendChild(img);
      buttons.classList.remove('hidden');

    } catch (error) {
      console.error('Error:', error);
      chrome.storage.local.set({ 
        error: error.message,
        generatedImage: null,
        generatedText: null
      });
      imageContainer.innerHTML = `
        <div class="text-red-500 p-4 text-center">
          Error: Failed to generate image. ${error.message}
        </div>`;
    } finally {
      loading.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });

  // Copy URL button with error handling
  document.getElementById('copyUrl').addEventListener('click', async () => {
    try {
      const result = await new Promise(resolve => {
        chrome.storage.local.get(['generatedImage'], resolve);
      });
      
      if (result.generatedImage) {
        await navigator.clipboard.writeText(result.generatedImage);
        alert('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy URL. Please try again.');
    }
  });

  // Download button with error handling
  document.getElementById('downloadImage').addEventListener('click', () => {
    chrome.storage.local.get(['generatedImage', 'generatedText'], (result) => {
      if (result.generatedImage) {
        try {
          const promptWords = result.generatedText.split(' ').slice(0, 3).join('_');
          const filename = `${promptWords}_generated.jpg`;
          
          chrome.downloads.download({
            url: result.generatedImage,
            filename: filename,
            saveAs: true
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              console.error('Download failed:', chrome.runtime.lastError);
              alert('Failed to download image. Please try again.');
            }
          });
        } catch (error) {
          console.error('Download error:', error);
          alert('Failed to process download. Please try again.');
        }
      } else {
        alert('No image available to download.');
      }
    });
  });

  // Clear any errors when starting a new generation
  promptInput.addEventListener('focus', () => {
    chrome.storage.local.remove('error');
  });
}); 