# Quick Start Guide

Get your TestNet Wallet up and running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ and npm installed
- Chrome or Brave browser
- Basic knowledge of blockchain development

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd testnet-wallet
npm install
```

This will install all required packages including:
- React & TypeScript
- ethers.js & @solana/web3.js
- Tailwind CSS
- Build tools (Vite)

### Step 2: Create Icon Files

Before building, you need to create three PNG icon files. Place them in `public/icons/`:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

**Quick way**: Use an online SVG to PNG converter with the provided `public/icons/icon.svg` template.

### Step 3: Update Configuration (Optional)

Edit `src/utils/network.ts` to add your Infura API key or use public RPC endpoints:

```typescript
sepolia: {
  // ...
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  // Or use public RPC:
  // rpcUrl: 'https://rpc.sepolia.org',
}
```

### Step 4: Build the Extension

```bash
npm run build
```

This creates a `build/` directory with all compiled files.

### Step 5: Load in Browser

1. Open Chrome/Brave and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `build/` directory from your project

### Step 6: Pin the Extension

Click the puzzle piece icon (🧩) in your browser toolbar and pin the TestNet Wallet extension for easy access.

## 🎯 First Use

### Create a New Wallet

1. Click the TestNet Wallet icon
2. Click **"Create Wallet"**
3. Your wallet is now ready with both EVM and Solana addresses!

### Get Test Tokens

1. Select a network (e.g., "Ethereum Sepolia")
2. Click **"💧 Get Test Tokens"**
3. Complete the faucet request
4. Wait a few seconds and click "↻ Refresh" to see your balance

### Test a Transaction

For EVM chains:
```javascript
// In your dApp's browser console
const accounts = await window.testnetWallet.request({ 
  method: 'eth_requestAccounts' 
});

const txHash = await window.testnetWallet.request({
  method: 'eth_sendTransaction',
  params: [{
    from: accounts[0],
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    value: '0x' + (0.01 * 1e18).toString(16), // 0.01 ETH
  }]
});

console.log('Transaction:', txHash);
```

## 🔧 Development Mode

For active development with hot reload:

```bash
npm run dev
```

After making changes, reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your TestNet Wallet extension

## 📚 Common Tasks

### Export Your Keys

1. Click the wallet icon
2. Click the settings gear icon
3. Click **"Show Private Keys"**
4. Copy your keys (remember: testnet only!)

### Switch Networks

Use the network dropdown in the main wallet view to switch between:
- Ethereum Sepolia
- Polygon Mumbai
- BSC Testnet
- Avalanche Fuji
- Fantom Testnet
- Local Hardhat/Anvil
- Solana Devnet

### Persist Your Wallet

By default, keys are stored in memory and wiped when you close the browser.

To save your wallet:
1. Go to Settings
2. Click **"Encrypt & Save Wallet"**
3. Enter a password (min 8 characters)
4. Click **"Save"**

### Clear Everything

If you want to start fresh:
1. Go to Settings
2. Scroll to "Danger Zone"
3. Click **"Clear Wallet & All Data"**

## 🧪 Testing with Your dApp

### Basic Integration

Add to your dApp:

```javascript
// Check if wallet is available
if (typeof window.testnetWallet !== 'undefined') {
  console.log('TestNet Wallet detected!');
  
  // Request accounts
  const accounts = await window.testnetWallet.request({ 
    method: 'eth_requestAccounts' 
  });
  
  console.log('Connected account:', accounts[0]);
}
```

### With ethers.js

```javascript
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.testnetWallet);
const signer = provider.getSigner();
const address = await signer.getAddress();

console.log('Address:', address);
```

### With Solana

```javascript
import { Connection } from '@solana/web3.js';

const { publicKey } = await window.solanaTestnetWallet.connect();
const connection = new Connection('https://api.devnet.solana.com');
const balance = await connection.getBalance(new PublicKey(publicKey));

console.log('Balance:', balance / 1e9, 'SOL');
```

## 🐛 Troubleshooting

### Extension doesn't show up

- Make sure you clicked "Load unpacked" and selected the `build/` directory
- Check that `build/manifest.json` exists
- Try refreshing the extensions page

### "No wallet found" error

- Make sure you've created a wallet first
- Try closing and reopening the extension popup

### Build fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript errors

These are normal during development before installing dependencies. Run:
```bash
npm install
```

### Can't connect to network

- Check your internet connection
- For Infura endpoints, verify your API key
- Try switching to a different network
- Check the browser console for error messages

## 📖 Next Steps

- Read [API.md](../API.md) for complete API documentation
- Check [README.md](../Readme.md) for detailed project information
- See [BUILD.md](./BUILD.md) for advanced build options

## 🎓 Learning Resources

### EVM Development
- [ethers.js docs](https://docs.ethers.org/)
- [Hardhat](https://hardhat.org/)
- [Remix IDE](https://remix.ethereum.org/)

### Solana Development
- [@solana/web3.js docs](https://solana-labs.github.io/solana-web3.js/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Playground](https://beta.solpg.io/)

## ⚠️ Important Reminders

- ✅ This wallet is for **testnet only**
- ✅ Never use with real funds or mainnet
- ✅ Mainnet is blocked by design
- ✅ Always backup your testnet keys if needed
- ✅ Test thoroughly before mainnet deployment

## 🤝 Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review [API.md](./API.md) for API examples
- Open an issue on GitHub
- Join our developer community

---

**Happy testing! 🧩**
