// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && window.browser ? window.browser : chrome;
/**
 * Connection approval popup script
 */

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tabId = urlParams.get('tabId');
const origin = urlParams.get('origin');

// Load wallet state
async function loadWalletInfo() {
  try {
  const result = await browser.storage.local.get(['walletState']);
    const walletState = result.walletState;
    
    if (walletState && walletState.evmAddress) {
      document.getElementById('account').textContent = 
        walletState.evmAddress.substring(0, 6) + '...' + walletState.evmAddress.substring(38);
    }
    
    if (origin) {
      document.getElementById('siteUrl').textContent = origin;
    }
  } catch (error) {
    console.error('Failed to load wallet info:', error);
  }
}

// Handle approval
document.getElementById('approveBtn').addEventListener('click', async () => {
  try {
  const result = await browser.storage.local.get(['walletState']);
    const walletState = result.walletState;
    
    if (!walletState || !walletState.evmAddress) {
      alert('Wallet is locked. Please unlock your wallet first.');
      window.close();
      return;
    }
    
    // Send approval to background script
  await browser.runtime.sendMessage({
      type: 'APPROVE_CONNECTION',
      tabId: parseInt(tabId),
      accounts: [walletState.evmAddress],
    });
    
    window.close();
  } catch (error) {
    console.error('Approval failed:', error);
    alert('Failed to approve connection: ' + error.message);
  }
});

// Handle rejection
document.getElementById('rejectBtn').addEventListener('click', async () => {
  try {
  await browser.runtime.sendMessage({
      type: 'REJECT_CONNECTION',
      tabId: parseInt(tabId),
    });
    
    window.close();
  } catch (error) {
    console.error('Rejection failed:', error);
    window.close();
  }
});

// Load wallet info on page load
loadWalletInfo();
