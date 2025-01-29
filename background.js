chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateImage",
    title: "Generate image for selected text",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateImage") {
    const selectedText = info.selectionText;
    
    fetch('https://api.studio.nebius.ai/v1/images/generations', {
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
        prompt: selectedText,
        model: "black-forest-labs/flux-schnell"
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      chrome.storage.local.set({ 
        generatedImage: data.data[0].url,
        generatedText: selectedText
      }, () => {
        // After storing the data, open the popup
        chrome.action.openPopup();
      });
    })
    .catch(error => {
      console.error('Error:', error);
      chrome.storage.local.set({ 
        error: error.message 
      });
    });
  }
}); 