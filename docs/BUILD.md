# Build Instructions

## Prerequisites

1. Install Node.js 18+ and npm
2. Chrome or Brave browser

## Setup

```bash
# Install dependencies
npm install
```

## Build

```bash
# Production build
npm run build
```

This will create a `build/` directory with all the compiled extension files.

## Load in Browser

### Chrome/Brave:

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `build/` directory

### Before First Build

**Important**: Create icon files:

The extension requires three PNG icon files in `public/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use online tools to convert the provided `icon.svg` to PNG at these sizes, or create custom icons.

## Development

```bash
# Development mode with hot reload
npm run dev
```

Then reload the extension in Chrome to see changes.

## Configuration

### Update Infura API Key

In `src/utils/network.ts`, replace `YOUR_KEY` with your Infura API key for Ethereum Sepolia:

```typescript
sepolia: {
  // ...
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  // ...
}
```

Alternatively, use a public RPC endpoint.

## Troubleshooting

### Build errors related to dependencies

Make sure all dependencies are installed:
```bash
npm install
```

### Extension doesn't load

1. Check that `build/manifest.json` exists
2. Ensure all icon files are present in `build/icons/`
3. Check browser console for errors

### TypeScript errors

TypeScript errors during development are normal until dependencies are installed. Run:
```bash
npm install
```

## Project Structure After Build

```
build/
├── manifest.json
├── index.html
├── background.js
├── content.js
├── inject.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── ...
```

## Next Steps

After building:

1. Load the extension in Chrome
2. Click the extension icon to open the popup
3. Create a new wallet or import an existing testnet wallet
4. Select a network and start testing!

## Notes

- The extension will only work with testnet networks
- Mainnet is blocked by design
- Keys are stored in memory by default (ephemeral)
- Use the "Encrypt & Save" option in settings to persist your wallet
