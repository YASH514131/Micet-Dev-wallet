// Polyfill for browser API (Firefox compatibility)
const browser = typeof self !== 'undefined' && (self as any).browser ? (self as any).browser : chrome;
/**
 * Background service worker for DevNet Wallet extension
 * Handles communication between content scripts and popup
 */

// Store pending connection requests
const pendingRequests = new Map<number, (response: any) => void>();

// Store pending transaction requests
const pendingTransactions = new Map<number, (response: any) => void>();

// Keep service worker alive
let keepAliveInterval: NodeJS.Timeout | undefined;

function keepAlive() {
  keepAliveInterval = setInterval(() => {
    // console.log('Keeping service worker alive...');
  }, 20000);
}

// Initialize on install
browser.runtime.onInstalled.addListener(() => {
  // console.log('DevNet Wallet installed');
  keepAlive();
});

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response: any) => void) => {
  // console.log('Background received message:', request);
  
  switch (request.type) {
    case 'GET_WALLET_STATE':
      handleGetWalletState(sendResponse);
      return true; // Keep channel open for async response
      
    case 'SIGN_TRANSACTION':
      handleSignTransaction(request.data, sendResponse);
      return true;
      
    case 'SEND_TRANSACTION':
      handleSendTransaction(request.data, sender, sendResponse);
      return true;
      
    case 'GET_ACCOUNTS':
      handleGetAccounts(sendResponse);
      return true;
      
    case 'REQUEST_ACCOUNTS':
      handleRequestAccounts(sender, sendResponse);
      return true;
      
    case 'APPROVE_CONNECTION':
      handleApproveConnection(request.tabId, request.accounts);
      return false;
      
    case 'REJECT_CONNECTION':
      handleRejectConnection(request.tabId);
      return false;
      
    case 'APPROVE_TRANSACTION':
      handleApproveTransaction(request.tabId, request.transaction);
      return false;
      
    case 'REJECT_TRANSACTION':
      handleRejectTransaction(request.tabId);
      return false;
      
    case 'SWITCH_NETWORK':
      handleSwitchNetwork(request.data, sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return false;
});

// Handle getting wallet state
async function handleGetWalletState(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['walletState', 'selectedNetwork', 'settings']);
    const selectedNetwork = result.selectedNetwork || 'sepolia';
    const settings = result.settings || {};
    const customRpcUrl = settings.customRpcUrls?.[selectedNetwork] || null;
    
    sendResponse({
      success: true,
      data: {
        walletState: result.walletState || null,
        selectedNetwork: selectedNetwork,
        customRpcUrl: customRpcUrl,
      },
    });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle transaction signing
async function handleSignTransaction(_data: any, sendResponse: (response: any) => void) {
  try {
    // console.log('📝 Sign transaction request:', data);
    sendResponse({ success: true, message: 'Transaction signing requested' });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle sending transaction
async function handleSendTransaction(data: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    // console.log('💸 Send transaction request:', data);
    
    // Get the tab ID and origin from sender
    const tabId = sender.tab?.id;
    const origin = sender.tab?.url ? new URL(sender.tab.url).origin : 'Unknown';
    
    if (!tabId) {
      sendResponse({ success: false, error: 'Cannot identify sender tab.' });
      return;
    }
    
    // Store the pending transaction
    pendingTransactions.set(tabId, sendResponse);
    
    // Open transaction approval popup
    const txParam = encodeURIComponent(JSON.stringify(data));
    chrome.windows.create({
      url: `transaction.html?tabId=${tabId}&origin=${encodeURIComponent(origin)}&tx=${txParam}`,
      type: 'popup',
      width: 420,
      height: 700,
    });
    
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle get accounts
async function handleGetAccounts(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['walletState']);
    const walletState = result.walletState;
    
    if (!walletState || !walletState.evmAddress) {
      sendResponse({ success: true, accounts: [] });
      return;
    }
    
    sendResponse({
      success: true,
      accounts: [walletState.evmAddress],
    });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Handle request accounts (requires user approval)
async function handleRequestAccounts(sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    // Check both session storage and walletState
  const SESSION_KEY = 'devnet_wallet_session';
    const result = await chrome.storage.local.get([SESSION_KEY, 'walletState', 'connectedSites']);
    
    let evmAddress = null;
    
    // First check walletState (where address is stored when unlocked)
    if (result.walletState && result.walletState.evmAddress) {
      evmAddress = result.walletState.evmAddress;
    }
    
    // console.log('📋 REQUEST_ACCOUNTS - walletState:', result.walletState);
    // console.log('📋 REQUEST_ACCOUNTS - sessionData:', result[SESSION_KEY]);
    // console.log('📋 REQUEST_ACCOUNTS - evmAddress:', evmAddress);
    
    if (!evmAddress) {
      // console.error('❌ No wallet found or locked');
      sendResponse({ 
        success: false, 
  error: 'Wallet is locked or not initialized. Please unlock your DevNet Wallet.' 
      });
      return;
    }
    
    // Get the tab ID and origin
    const tabId = sender.tab?.id;
    const origin = sender.tab?.url ? new URL(sender.tab.url).origin : 'Unknown';
    
    if (!tabId) {
      sendResponse({ success: false, error: 'Cannot identify sender tab.' });
      return;
    }
    
    // Check if this site is already connected
    const connectedSites = result.connectedSites || {};
    if (connectedSites[origin]) {
      // Site is already approved - return accounts immediately
      console.log('✅ Site already connected:', origin);
      sendResponse({
        success: true,
        accounts: [evmAddress],
      });
      return;
    }
    
    // Store the pending request
    pendingRequests.set(tabId, sendResponse);
    
    // Open approval popup
    chrome.windows.create({
      url: `approval.html?tabId=${tabId}&origin=${encodeURIComponent(origin)}`,
      type: 'popup',
      width: 400,
      height: 600,
    });
    
  } catch (error: any) {
    // console.error('❌ Error in handleRequestAccounts:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle connection approval
async function handleApproveConnection(tabId: number, accounts: string[]) {
  const sendResponse = pendingRequests.get(tabId);
  if (sendResponse) {
    // console.log('✅ Connection approved for tab:', tabId);
    
    try {
      // Get the origin from the tab
      const tab = await chrome.tabs.get(tabId);
      if (tab.url) {
        const origin = new URL(tab.url).origin;
        
        // Store this site as connected
        const result = await chrome.storage.local.get('connectedSites');
        const connectedSites = result.connectedSites || {};
        connectedSites[origin] = {
          connectedAt: Date.now(),
          accounts: accounts,
        };
        
        await chrome.storage.local.set({ connectedSites });
        console.log('💾 Site connection saved:', origin);
      }
    } catch (error) {
      console.warn('⚠️ Failed to save site connection:', error);
    }
    
    sendResponse({
      success: true,
      accounts,
    });
    pendingRequests.delete(tabId);
  }
}

// Handle connection rejection
async function handleRejectConnection(tabId: number) {
  const sendResponse = pendingRequests.get(tabId);
  if (sendResponse) {
    // console.log('❌ Connection rejected for tab:', tabId);
    
    try {
      // Remove this site from connected list if it exists
      const tab = await chrome.tabs.get(tabId);
      if (tab.url) {
        const origin = new URL(tab.url).origin;
        const result = await chrome.storage.local.get('connectedSites');
        const connectedSites = result.connectedSites || {};
        
        if (connectedSites[origin]) {
          delete connectedSites[origin];
          await chrome.storage.local.set({ connectedSites });
          console.log('🗑️ Site connection removed:', origin);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to update site connection:', error);
    }
    
    sendResponse({
      success: false,
      error: 'User rejected the connection request.',
    });
    pendingRequests.delete(tabId);
  }
}

// Handle transaction approval
async function handleApproveTransaction(tabId: number, transaction: any) {
  const sendResponse = pendingTransactions.get(tabId);
  if (sendResponse) {
    // console.log('✅ Transaction approved for tab:', tabId);
    
    try {
      // Get wallet from session storage
  const SESSION_KEY = 'devnet_wallet_session';
      const result = await chrome.storage.local.get([SESSION_KEY]);
      const sessionData = result[SESSION_KEY];
      
      if (!sessionData || !sessionData.data || !sessionData.data.evmPrivateKey) {
        throw new Error('Wallet is locked. Please unlock your wallet.');
      }
      
      // Create a temporary offscreen document to sign the transaction
      // (Service workers can't use ethers.js directly)
      const signerUrl = chrome.runtime.getURL('signer.html');
      
  // console.log('🔐 Opening signer window...');
      
      // Generate unique request ID
      const requestId = Date.now().toString();
      
      // Get custom RPC URL if configured
      const networkResult = await chrome.storage.local.get(['selectedNetwork', 'settings']);
      const selectedNetwork = networkResult.selectedNetwork || 'sepolia';
      const settings = networkResult.settings || {};
      const customRpcUrl = settings.customRpcUrls?.[selectedNetwork] || null;
      
      // Store transaction for signer to pick up
      await chrome.storage.local.set({
        pendingSignerTransaction: {
          transaction,
          privateKey: sessionData.data.evmPrivateKey,
          requestId,
          customRpcUrl,
        }
      });
      
      // Open signer in background (hidden for performance)
      const signerWindow = await chrome.windows.create({
        url: signerUrl,
        type: 'popup',
        width: 1,
        height: 1,
        left: -9999,
        top: -9999,
        focused: false,
      });
      
  // console.log('⏳ Waiting for signer to process transaction...');
      
      // Poll for result
      const pollForResult = async (): Promise<any> => {
        for (let i = 0; i < 300; i++) { // Poll for up to 30 seconds
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const result = await chrome.storage.local.get([`signerResult_${requestId}`]);
          if (result[`signerResult_${requestId}`]) {
            // Clean up
            await chrome.storage.local.remove([`signerResult_${requestId}`]);
            return result[`signerResult_${requestId}`];
          }
        }
        throw new Error('Signer timeout after 30 seconds');
      };
      
      try {
        const response = await pollForResult();
  // console.log('📥 Received response from signer:', response);
        
        // Close signer window if still open
        if (signerWindow.id) {
          try {
            await chrome.windows.remove(signerWindow.id);
            // console.log('🗑️ Signer window closed');
      } catch (_e) {
        // console.warn('Failed to close signer window:', _e);
          }
        }
        
        if (response && response.success) {
          // console.log('✅ Transaction broadcasted:', response.hash);
          sendResponse({
            success: true,
            hash: response.hash,
            pending: response.pending || false,
          });
        } else {
          // console.error('❌ Transaction failed:', response?.error);
          sendResponse({
            success: false,
            error: response?.error || 'Transaction failed',
            hash: response?.hash,
          });
        }
      } catch (error: any) {
        // console.error('❌ Signer error:', error);
        
        // Close signer window
        if (signerWindow.id) {
          try {
            await chrome.windows.remove(signerWindow.id);
          } catch (_e) {
            // console.warn('Failed to close signer window:', _e);
          }
        }
        
        sendResponse({
          success: false,
          error: error.message || 'Transaction signing failed',
        });
      }
      
      pendingTransactions.delete(tabId);
      
    } catch (error: any) {
      // console.error('❌ Error approving transaction:', error);
      sendResponse({
        success: false,
        error: error.message,
      });
      pendingTransactions.delete(tabId);
    }
  }
}

// Handle transaction rejection
function handleRejectTransaction(tabId: number) {
  const sendResponse = pendingTransactions.get(tabId);
  if (sendResponse) {
    // console.log('❌ Transaction rejected for tab:', tabId);
    sendResponse({
      success: false,
      error: 'User rejected the transaction.',
    });
    pendingTransactions.delete(tabId);
  }
}

// Handle network switch
async function handleSwitchNetwork(data: any, sendResponse: (response: any) => void) {
  try {
    await chrome.storage.local.set({ selectedNetwork: data.network });
    
    // Notify all tabs about network change
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'NETWORK_CHANGED',
          network: data.network,
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
    
    sendResponse({ success: true });
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

// Clean up on unload
self.addEventListener('beforeunload', () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
});

export {};
