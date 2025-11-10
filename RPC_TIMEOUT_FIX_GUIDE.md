# 🔧 RPC Timeout Fix - Sepolia Balance Issue

## Problem
The wallet was **stuck on "Refreshing..."** because the RPC endpoint was timing out with no timeout handler.

## Root Cause
1. **No timeout set** on ethers.js provider calls
2. **BlastAPI endpoint** was unreliable/slow
3. **No error message** to tell user what went wrong

## What I Fixed

### ✅ 1. Added 10-second timeout to balance fetches
```typescript
// Now includes timeout handling
const timeoutPromise = new Promise<never>((_, reject) => 
  setTimeout(() => reject(new Error(`RPC timeout after ${timeout}ms`)), timeout)
);

const balance = await Promise.race([balancePromise, timeoutPromise]);
```

### ✅ 2. Updated RPC endpoint to more reliable one
- Old: `https://eth-sepolia.public.blastapi.io` (unreliable)
- New: `https://rpc.sepolia.org` (official, more stable)

### ✅ 3. Added detailed console logging
Browser console will now show:
```
📡 [EVM] Provider type: StaticJsonRpcProvider (public)
⏳ [EVM] Calling eth_getBalance for public network...
✅ [EVM] Balance fetched successfully: 1.5 ETH
💰 [EVM] Raw balance (wei): 1500000000000000000
```

### ✅ 4. Helpful error messages in UI
If RPC times out, user sees:
```
⏱️ RPC endpoint timeout - try refreshing or switching networks
```

## How to Test

1. **Load the updated extension**
   - Go to `about:debugging` in Firefox
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `build/manifest.json`

2. **Open browser console** (F12 → Console tab)

3. **Switch to Ethereum Sepolia network**

4. **Click "↻ Refresh Balance"**

5. **Watch the console** - you should see:
   ```
   📡 [EVM] Provider type: StaticJsonRpcProvider (public)
   ⏳ [EVM] Calling eth_getBalance for public network...
   ✅ [EVM] Balance fetched successfully: X.XXXX ETH
   ```

## Expected Behavior Now

- ✅ Balance refreshes in **~2-3 seconds** (no longer stuck)
- ✅ If RPC fails to respond in 10 seconds, shows error instead of infinite loading
- ✅ Detailed console logs to debug any issues
- ✅ Helpful error messages guide users to solutions

## If Balance Still Shows 0

### Check 1: Is the address correct?
```
1. In wallet UI, copy your address
2. Go to https://sepolia.etherscan.io
3. Paste address in search bar
4. If you see transactions, address is correct - RPC just hasn't synced
```

### Check 2: Is the RPC endpoint responding?
Open browser console and run:
```javascript
fetch('https://rpc.sepolia.org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 })
}).then(r => r.json()).then(console.log)
```

Should return something like:
```json
{
  "jsonrpc": "2.0",
  "result": "0xaa36a7",
  "id": 1
}
```

### Check 3: Alternative RPC endpoints (if Sepolia RPC is slow)
You can manually edit `src/utils/network.ts` and try:

```typescript
sepolia: {
  // Option 1: Official (already using)
  rpcUrl: 'https://rpc.sepolia.org',
  
  // Option 2: Alchemy (register for free API key)
  rpcUrl: 'https://eth-sepolia.alchemyapi.io/v2/YOUR_API_KEY',
  
  // Option 3: Infura (register for free)
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_API_KEY',
  
  // Option 4: PublicNode
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
}
```

## Console Messages You'll See

| Message | Meaning |
|---------|---------|
| `📡 [EVM] Fetching balance for 0x...` | Started fetching balance |
| `📡 [EVM] Using RPC: https://...` | Which RPC endpoint is being used |
| `⏳ [EVM] Calling eth_getBalance...` | Making the RPC call |
| `✅ [EVM] Balance fetched: X ETH` | Success! Balance is available |
| `⏱️ [EVM] RPC timeout` | RPC didn't respond in 10 seconds - try different RPC |
| `🔴 [EVM] Error fetching balance: ...` | Error occurred - check the specific message |

## What to Do If Still Stuck

1. **Clear browser cache**: Ctrl+Shift+Delete → "All time"
2. **Reload extension**: Go to `about:debugging` → "Reload"
3. **Try a different network**: Switch to Polygon Amoy or BSC Testnet
4. **Check console for errors**: F12 → Console tab → look for 🔴 errors
5. **Tell me the exact error message** and I can fix it specifically

---

## Files Modified
- `src/utils/evm.ts` - Added timeout to getBalance()
- `src/utils/network.ts` - Updated Sepolia RPC to more reliable endpoint
- `src/popup/components/WalletView.tsx` - Better error handling and user feedback
