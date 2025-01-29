document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['generatedImage', 'generatedText', 'error'], (result) => {
    if (result.error) {
      // Show error message
      document.getElementById('imageContainer').innerHTML = `
        <div style="color: red; padding: 20px;">
          Error: ${result.error}
        </div>
      `;
      // Clear the error after showing it
      chrome.storage.local.remove('error');
    } else if (result.generatedImage) {
      document.getElementById('generatedImage').src = result.generatedImage;
      document.getElementById('prompt').textContent = `"${result.generatedText}"`;
    }
  });

  document.getElementById('copyUrl').addEventListener('click', () => {
    chrome.storage.local.get(['generatedImage'], (result) => {
      if (result.generatedImage) {
        navigator.clipboard.writeText(result.generatedImage)
          .then(() => alert('URL copied to clipboard!'));
      }
    });
  });

  document.getElementById('downloadImage').addEventListener('click', () => {
    chrome.storage.local.get(['generatedImage', 'generatedText'], (result) => {
      if (result.generatedImage) {
        // Create filename from the first few words of the prompt
        const promptWords = result.generatedText.split(' ').slice(0, 3).join('_');
        const filename = `${promptWords}_generated.jpg`;
        
        // Use chrome.downloads API to download the image
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
      }
    });
  });

  // Add side panel button handler
  document.getElementById('openSidePanel').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.sidePanel.open({ tabId: tabs[0].id });
      window.close(); // Close the popup after opening side panel
    });
  });
}); 