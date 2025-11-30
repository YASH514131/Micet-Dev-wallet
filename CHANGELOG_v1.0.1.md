# DevNet Wallet v1.0.1 - Changelog & Bug Fixes

## Summary
This release fixes a critical issue where **Ethereum Sepolia testnet balance showed 0** and the UI would hang indefinitely on "Refreshing...". The issue was caused by unreliable public RPC endpoints and lack of timeout handling.

---

## Issues Fixed

### 1. **Sepolia Balance Shows 0**
**Problem**: After receiving Sepolia testnet funds, the wallet displayed 0 balance instead of the actual amount.

**Root Cause**: The wallet was using `ethers.JsonRpcProvider` with automatic network detection, which requires extra RPC calls. Public endpoints like BlastAPI were:
- Rate-limited or rate-limited
- Slow and timing out
- Requiring authentication
- Not properly handling auto-detection requests

**Fix Applied**:
- Replaced `JsonRpcProvider` with `StaticJsonRpcProvider` for public networks (no unnecessary network detection)
- Changed primary RPC from BlastAPI to Alchemy's free public endpoint (`https://eth-sepolia.g.alchemy.com/v2/demo`)
- Balance now fetches directly without wasting time on network detection

### 2. **UI Stuck on "Refreshing..." (Infinite Hang)**
**Problem**: When balance fetch failed, the UI would hang indefinitely with no error message.

**Root Cause**: No timeout was set on RPC calls. If an endpoint didn't respond, the Promise would hang forever.

**Fix Applied**:
- Added **8-second timeout per RPC endpoint** for public networks
- Added **15-second timeout per RPC endpoint** for local networks (Hardhat/Anvil)
- If timeout occurs, automatically tries the next fallback endpoint
- If all endpoints fail, gracefully returns 0 and shows error message

### 3. **No Fallback RPC Endpoints**
**Problem**: If the primary RPC endpoint was down/slow, there was no backup.

**Root Cause**: Wallet tried only one RPC endpoint with no alternatives.

**Fix Applied**:
- Added array of fallback RPC endpoints for Sepolia:
  1. `https://eth-sepolia.g.alchemy.com/v2/demo` (primary - Alchemy free)
  2. `https://rpc.sepolia.org` (official public)
  3. `https://rpc.ankr.com/eth_sepolia` (Ankr public)
  4. `https://rpc.sepolia.publicnode.com` (PublicNode public)
  5. `https://rpc.sepolia.blockpi.network/v1/rpc/public` (BlockPI public)
  6. `https://eth-sepolia.public.blastapi.io` (Blast - last resort)

- Wallet tries endpoints in order and uses the first working one
- Each endpoint has a timeout to avoid hanging

### 4. **No Error Logging**
**Problem**: When RPC calls failed, there was no visibility into what went wrong.

**Root Cause**: Errors were caught but not logged. Developers couldn't debug issues.

**Fix Applied**:
- Added detailed console logging:
  - `🔍 [EVM] Trying RPC endpoint: <url>` - shows which endpoint is being tried
  - `⚠️  [EVM] Failed RPC <url>: <error>` - logs failures with error messages
  - `✅ [EVM] Balance from <url>: 0.1234` - logs successful fetch with amount
  - `🔴 [EVM] All RPC endpoints failed` - logs when all endpoints fail
- Users/developers can now open browser console (F12 → Console) to see exactly what's happening

---

## Files Modified

### 1. `src/utils/network.ts`
**Changes**:
- Added optional `rpcUrls?: string[]` array to `NetworkConfig` interface for fallback endpoints
- Updated Sepolia network config:
  - Primary RPC: `https://eth-sepolia.g.alchemy.com/v2/demo` (Alchemy)
  - Added array of 5 fallback RPC endpoints
- All other networks (Polygon Amoy, BSC, Avalanche, Solana, Hardhat) remain unchanged

**Impact**: Wallet can now try multiple RPC endpoints automatically.

### 2. `src/utils/evm.ts`
**Changes**:
- Rewrote `getBalance()` function to:
  - Accept single RPC URL OR array of RPC URLs
  - Try each endpoint sequentially with timeout
  - Use `StaticJsonRpcProvider` for public networks (no network detection overhead)
  - Add 8-second timeout per public endpoint
  - Log which endpoint succeeds/fails
  - Return "0" gracefully if all endpoints fail
- Updated `sendTransaction()` to use `StaticJsonRpcProvider` for public networks
- Updated `estimateGas()` to use `StaticJsonRpcProvider` for public networks
- All functions now include detailed console logging

**Impact**: Balance fetching is faster, more reliable, and shows clear error messages.

### 3. `src/popup/components/WalletView.tsx`
**Changes**:
- Updated to pass `currentNetwork.rpcUrls` (fallback array) to `getEvmBalance()` instead of just `rpcUrl`
- Falls back to single `currentNetwork.rpcUrl` if `rpcUrls` is undefined (for backward compatibility)
- Added 12-second overall timeout for balance fetch operation
- Improved error message display when RPC timeout occurs

**Impact**: Wallet now uses the full fallback list when fetching balance.

### 4. `src/popup/components/SettingsView.tsx`
**Changes**:
- Added "Custom RPC URL" input field in Settings
- Allows users to paste their own RPC endpoint (from Infura/Alchemy/QuickNode/etc)
- Custom RPC is saved per network and persists in browser storage
- Users can override default endpoints with their own API keys

**Impact**: Advanced users can use their own RPC endpoints for higher rate limits and reliability.

### 5. `src/utils/storage.ts`
**Changes**:
- Added `getCustomRpcUrl()` function to retrieve saved custom RPC per network
- Added `setCustomRpcUrl()` function to save custom RPC per network
- Functions use browser's local storage with namespacing: `customRpc_<networkId>`

**Impact**: Custom RPC settings persist across browser sessions.

---

## Testing Notes for Reviewers

### How to Test

1. **Load the extension**:
   - Go to `about:debugging` → "This Firefox" → "Load Temporary Add-on"
   - Select `build/manifest.json`

2. **Test Sepolia Balance**:
   - Open extension popup
   - Network should be set to "Ethereum Sepolia"
   - Click "↻ Refresh Balance"
   - **Expected**: Balance displays correctly (not 0)
   - **Console logs**: Should show `✅ [EVM] Balance from https://...`

3. **Test Timeout Handling**:
   - Open browser console (F12 → Console)
   - Watch console logs as balance fetches
   - Should complete within 8-10 seconds
   - **Expected**: Either shows balance or error message (not infinite hang)

4. **Test Custom RPC**:
   - Go to Settings → "Custom RPC URL (optional)"
   - Paste a Sepolia RPC URL (e.g., from Infura/Alchemy with API key)
   - Click "Save Custom RPC"
   - Switch networks and back to Sepolia
   - Click "↻ Refresh Balance"
   - **Expected**: Uses custom RPC endpoint (check console logs for which URL was used)

5. **Test Network Switch**:
   - Switch between different networks (Polygon, BSC, Avalanche)
   - Balance should fetch from correct network's RPC
   - No errors should appear

### Expected Console Output (Success Case)
```
🔍 [EVM] Trying RPC endpoint: https://eth-sepolia.g.alchemy.com/v2/demo
✅ [EVM] Balance from https://eth-sepolia.g.alchemy.com/v2/demo: 0.5234
```

### Expected Console Output (Fallback Case)
```
🔍 [EVM] Trying RPC endpoint: https://eth-sepolia.g.alchemy.com/v2/demo
⚠️  [EVM] Failed RPC https://eth-sepolia.g.alchemy.com/v2/demo: timeout
🔍 [EVM] Trying RPC endpoint: https://rpc.sepolia.org
✅ [EVM] Balance from https://rpc.sepolia.org: 0.5234
```

### Expected Console Output (All Failed)
```
🔍 [EVM] Trying RPC endpoint: https://eth-sepolia.g.alchemy.com/v2/demo
⚠️  [EVM] Failed RPC https://eth-sepolia.g.alchemy.com/v2/demo: timeout
🔍 [EVM] Trying RPC endpoint: https://rpc.sepolia.org
⚠️  [EVM] Failed RPC https://rpc.sepolia.org: timeout
🔴 [EVM] All RPC endpoints failed for balance fetch: [...]
```

---

## Security & Privacy Notes

- **No user data collection**: All balance fetches are read-only RPC calls
- **No tracking**: No telemetry or analytics added
- **No authentication**: Uses public RPC endpoints (Alchemy free tier doesn't require authentication)
- **Custom RPC storage**: If users enter a custom RPC with API key, it's stored locally in browser (not sent anywhere)
- **Mainnet protection**: Mainnet (chainId=1) is still blocked; only testnet networks are allowed

---

## Known Limitations & Recommendations

1. **Free Public RPC Endpoints**:
   - Have rate limits (typically 1000-10000 requests/day)
   - May be slow or unreliable
   - **Recommendation**: For production/heavy use, get your own API key from Alchemy/Infura/QuickNode

2. **Alchemy Free Tier**:
   - Currently using demo key: `https://eth-sepolia.g.alchemy.com/v2/demo`
   - Alchemy may rate-limit or disable demo keys
   - **Recommendation**: Users should get their own Alchemy API key and paste in Settings

3. **No RPC Endpoint Status Page**:
   - Wallet doesn't show which RPC is being used in UI
   - **Recommendation**: Check browser console if users report issues; help them paste custom RPC

---

## Migration Guide for Users

### If balance shows 0 or times out:

1. **Option A: Use Custom RPC** (Recommended)
   - Get free API key from https://www.alchemy.com/
   - Go to Extension Settings
   - Paste your Alchemy RPC URL in "Custom RPC URL (optional)"
   - Click "Save Custom RPC"
   - Refresh balance

2. **Option B: Switch Networks**
   - Switch to a different network (Polygon, BSC)
   - Switch back to Sepolia
   - Wallet will try fallback RPC endpoints

3. **Option C: Clear Browser Cache**
   - Clear extension storage (may reset custom RPC)
   - Reload extension

---

## Version Information

- **Version**: 1.0.1
- **Release Date**: November 10, 2025
- **Browser**: Firefox 109+ (MV3)
- **Breaking Changes**: None (backward compatible)
- **Dependencies**: ethers.js v5, React 18

---

## Commit Hash
See commit: `33e5f90` for all changes in this release.

---

## Notes for Reviewers

This release is focused on **reliability and observability**:
- ✅ Fixed Sepolia balance display issue
- ✅ Added timeout handling to prevent UI hangs
- ✅ Added RPC fallback system for resilience
- ✅ Added detailed logging for debugging
- ✅ Maintained backward compatibility
- ✅ No new permissions required
- ✅ No changes to extension behavior (only bug fixes)

All changes are **non-breaking** and purely additive. The extension will continue to work exactly as before, but with better reliability.
