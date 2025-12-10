# DevNet Wallet - Changelog

## Version 1.0.3 (Latest) - November 30, 2025

### 🆕 New Features

#### 1. **Dynamic Network Detection for Remix**
- Fixed "Can't detect network" error when using Remix IDE
- `eth_chainId` and `net_version` now return dynamic values based on selected network
- Remix can now properly identify which network you're connected to
- Works with both EVM and Solana networks

#### 2. **Custom RPC Endpoint Support**
- Users can now add custom Alchemy RPC endpoints
- Network info displays whether you're using **Default RPC** or **Custom RPC**
- Visual indicators in UI show RPC type clearly
- All custom RPCs are stored and persisted in browser storage

#### 3. **Connection Persistence**
- **Fixed recurring "Connect" popup issue** - no more repeated approvals!
- Wallet now remembers which sites you've already connected to
- Connection data stored per site/tab to prevent spam requests
- Added **"Connected Sites" management** in Settings to:
  - View all connected sites/DApps
  - Disconnect from any site instantly
  - Revoke permissions anytime

#### 4. **Improved UI for RPC Management**
- New section in Wallet view showing current RPC status
- Visual badge indicating if using Default or Custom RPC
- Settings shows active RPC endpoint
- Easy switching between networks without re-approving

### 🔧 Technical Improvements

#### Network Detection
- Implemented NETWORK_CONFIG with mappings for all supported networks
- Dynamic chainId calculation based on selected network
- Proper Ethereum JSON-RPC compliance for tooling support

#### Connection Management
- Connection state stored in `connectedSites` storage
- Each connection tracked with timestamp and network info
- Automatic cleanup of old connections
- Per-site permission isolation

#### RPC Handling
- Fallback RPC endpoints for all networks
- Timeout protection (8s for public, 15s for local networks)
- Graceful error handling with user feedback
- Network detection no longer blocks balance fetches

### 🎨 UI/UX Changes

#### Settings View Enhancements
- New **"Connected Sites"** section shows:
  - List of all connected DApps
  - Connection date/time
  - Current network for each connection
  - Disconnect button for each site
- RPC endpoint clearly displayed
- Better visual organization

#### Wallet View Improvements
- RPC status badge (Default/Custom)
- Network information card
- Clear indication of active endpoint
- Improved network switching UX

### ⚠️ Important Fixes

- **Remix IDE integration fixed** ✅
- **No more repeated connect popups** ✅
- **Custom RPC fully supported** ✅
- **Network detection compliant with JSON-RPC spec** ✅

### 🚀 How to Use New Features

#### Connect to Remix with Custom RPC:
1. Open Settings
2. Add your Alchemy RPC endpoint in Network settings
3. Go to Remix IDE
4. Select your network in Remix
5. Connect wallet - **only ONE time!**
6. Remix will now properly detect your network

#### Manage Connected Sites:
1. Open Settings
2. Scroll to "Connected Sites" section
3. View all connected DApps
4. Click "Disconnect" to revoke access

### 📝 Version History

**v1.0.3** - November 30, 2025
- Dynamic network detection for Remix
- Custom RPC support
- Connection persistence & management
- UI improvements for RPC display
- Firefox validation fixes
- Minimum Firefox version: 113.0

**v1.0.2** - Previous
- Core wallet functionality
- EVM & Solana network support
- Basic transaction signing

**v1.0.1** - Initial Release
- First public version
- Basic DevNet wallet features

---

## For Users Coming from v1.0.2

### What Changed:
✅ Better Remix support - no more network detection errors
✅ Cleaner experience - no repeated "Connect" popups
✅ More control - manage all connected DApps
✅ Custom RPC support - use your own endpoints
✅ Better UI - clearer RPC status display

### Migration:
- No action needed! Your existing wallets and settings are preserved
- All previous transactions remain intact
- Connected sites are automatically migrated

### For Developers:
If you were experiencing:
- `net_version` not returning correct values → **FIXED** ✅
- `eth_chainId` mismatch with network → **FIXED** ✅
- Repeated connection popups → **FIXED** ✅
- Custom RPC endpoints not working → **FIXED** ✅

---

## Known Limitations

- Solana custom RPC requires endpoint URL
- Some DApps may cache the first connection - clear cache if issues persist
- Local network detection requires Hardhat/Anvil running on default ports

## Support

- Report bugs: [GitHub Issues](https://github.com/YASH514131/Micet-Dev-wallet/issues)
- Questions: Check the [README](./Readme.md)
- Documentation: See [docs/](./docs/) folder

---

**Thank you for using DevNet Wallet! 🚀**
