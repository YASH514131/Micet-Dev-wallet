# Debug Wallet Injection in Remix

Open the Remix page, press F12 to open console, and run these commands:

```javascript
// Check if window.ethereum exists
console.log('window.ethereum:', window.ethereum);

// Check wallet properties
console.log('isTestnetWallet:', window.ethereum?.isTestnetWallet);
console.log('isMetaMask:', window.ethereum?.isMetaMask);

// Check if request method exists
console.log('request method:', typeof window.ethereum?.request);

// Test a simple request
window.ethereum.request({ method: 'eth_accounts' })
  .then(accounts => console.log('Accounts:', accounts))
  .catch(err => console.error('Error:', err));
```

**What to check:**
1. `window.ethereum` should be an object
2. `isTestnetWallet` should be `true`
3. `isMetaMask` should be `true`
4. `request` should be `function`

If any of these are wrong, copy the console output and send it to me.

**If window.ethereum is null/undefined:**
1. Make sure the extension is loaded: `chrome://extensions/`
2. Check that TestNet Wallet is enabled (toggle is blue)
3. Reload Remix completely (Ctrl+Shift+R)
4. Check the extension console for errors

**To check extension console:**
1. Go to `chrome://extensions/`
2. Find "TestNet Wallet"
3. Click "service worker" or "Inspect views"
4. Look for any errors
