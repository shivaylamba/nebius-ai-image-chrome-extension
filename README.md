#  AI Blogging Assistant Suite - Chrome Extension powered by Nebius AI

A powerful Chrome extension that enhances your blogging workflow with AI-powered tools using [Nebius AI Studio](https://studio.nebius.ai/) with support for models like Flux and Deepseek R1. This suite helps bloggers generate relevant images and receive instant content reviews while writing or editing blog posts.

## Features

### 1. Quick Access Tools
- **Floating Overlay**: Select any text to reveal a convenient floating menu with AI tools
- **Context Menu**: Right-click selected text for alternative access to AI features
- **Keyboard Shortcuts**: 
  - `Ctrl+B` (Windows) / `Cmd+B` (Mac): Open popup
  - `Ctrl+Shift+B` (Windows) / `Cmd+Shift+B` (Mac): Toggle side panel

### 2. AI Image Generation
- Generate relevant images from text descriptions
- Perfect for blog post headers and illustrations
- Customizable image dimensions
- Quick download and copy options

### 3. AI Content Review
- Instant feedback on your blog content
- Real-time streaming response
- Choose between different AI models:
  - DeepSeek V3 (Default)
  - DeepSeek R1
- Technical accuracy checks
- Writing style suggestions
- Content improvement recommendations

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


## Usage

### Image Generation
1. Select text that describes the image you want
2. Either:
   - Click the floating overlay's image icon
   - Right-click and select "AI Tools > Generate image from text"
3. The side panel will open and automatically generate your image
4. Download or copy the generated image

### Content Review
1. Select the text you want to review
2. Either:
   - Click the floating overlay's review icon
   - Right-click and select "AI Tools > Review text with AI"
3. The side panel will open and start streaming the AI review
4. Choose your preferred AI model for different review styles
5. Copy the review suggestions when complete

## 🏗️ Built With
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Nebius AI Studio](https://studio.nebius.ai/) - Image generation using Flux model
