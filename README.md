# Nebius AI Text to Image Chrome Extension

This is a Chrome extension that generates images from text using [Nebius AI Studio](https://studio.nebius.ai/) Flux model. This extension allows you to generate images both from selected text on any webpage and through a dedicated side panel interface. This is particularly useful for instance when writing blogs and need to quickly generate an image for that specific blog. 


## 🚀 Installation

1. Clone this repository
2. Install dependencies:

```
npm install
```

3. Build the Tailwind CSS:

```
npm run build:prod
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## 🛠️ Development

To start development with hot-reloading CSS:

```
npm run dev
```


## 🎮 Usage

### Context Menu
1. Select text on any webpage
2. Right-click and select "Generate image for selected text"
3. View the generated image in the popup
4. Download or copy the image URL

### Side Panel
1. Click the extension icon
2. Click "Open side panel" or use `Ctrl+Shift+B` (`Cmd+Shift+B` on Mac)
3. Enter your prompt
4. Click "Generate Image"


## 🏗️ Built With
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Nebius AI Studio](https://studio.nebius.ai/) - Image generation using Flux model
