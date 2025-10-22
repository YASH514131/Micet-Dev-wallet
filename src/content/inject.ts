// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && (window as any).browser ? (window as any).browser : chrome;
/**
 * Content script that injects wallet APIs into web pages
 * Provides window.devnetWallet (EVM) and window.solanaDevnetWallet (Solana)
 */

let trustedToken: string | null = null;
let devnetProvider: any = null;

// Store a reference to DevNet provider after injection
function captureDevnetProvider() {
  devnetProvider = (window as any).ethereum;
}

// Guard against Phantom overwriting our provider
function guardEthereum() {
  if (!devnetProvider || devnetProvider !== (window as any).ethereum) {
    // Phantom or another wallet overwrote window.ethereum; restore ours
    if (devnetProvider && devnetProvider.isDevnetWallet) {
      (window as any).ethereum = devnetProvider;
      // console.log('🛡️ Restored DevNet Wallet after Phantom override');
    }
  }
}

// Inject ASAP to beat other wallets
function injectScript() {
  try {
    const script = document.createElement('script');
  script.src = browser.runtime.getURL('inject.js');
    script.onload = function() {
      script.remove();
      // Capture DevNet provider right after injection
      setTimeout(captureDevnetProvider, 50);
    };
    
    // Inject at the very beginning
    const target = document.head || document.documentElement;
    if (target.firstChild) {
      target.insertBefore(script, target.firstChild);
    } else {
      target.appendChild(script);
    }
  } catch (_error) {
  // console.error('Failed to inject DevNet Wallet:', _error);
  }
}

// Monitor for Phantom or other wallets trying to override window.ethereum
function monitorEthereumOverride() {
  // Poll periodically to detect and restore our provider
  const guardInterval = setInterval(() => {
    guardEthereum();
  }, 100);
  
  // Stop after 10 seconds (page fully loaded)
  setTimeout(() => {
    clearInterval(guardInterval);
  }, 10000);
}

// Run immediately
injectScript();
// Start guarding after a delay to let injection complete
setTimeout(monitorEthereumOverride, 100);

// Listen for messages from the injected script
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  const payload = event.data;
  if (!payload || typeof payload !== 'object') {
    return;
  }

  if (payload.type === 'DEVNET_WALLET_HANDSHAKE') {
    if (typeof payload.token === 'string' && payload.token.length <= 256) {
      trustedToken = payload.token;
      window.postMessage({
        type: 'DEVNET_WALLET_HANDSHAKE',
        acknowledged: true,
        token: trustedToken,
      }, '*');
    }
    return;
  }

  if (!trustedToken || payload.token !== trustedToken) {
    return;
  }
  
  // Ignore our own response messages to prevent infinite loop
  if (payload.type && payload.type.startsWith('DEVNET_WALLET_') && !payload.type.endsWith('_RESPONSE')) {
  // console.log('📤 Content script received:', payload.type);
    
    try {
      // Check if extension context is valid
  if (!browser.runtime?.id) {
        throw new Error('Extension context invalidated. Please refresh the page.');
      }
      
      // Forward to background script
      const backgroundRequest = {
        type: payload.type.replace('DEVNET_WALLET_', ''),
        data: payload.data,
      };
  // console.log('📤 Forwarding to background:', backgroundRequest);
      
  const response = await browser.runtime.sendMessage(backgroundRequest);
  // console.log('📥 Background response:', response);
      
      // Send response back to page
      window.postMessage({
        type: payload.type + '_RESPONSE',
        id: payload.id,
        response,
        token: trustedToken,
      }, '*');
  // console.log('✅ Response sent to page');
    } catch (error: any) {
  // console.error('❌ Error forwarding message:', error);
      
      // Provide helpful error message
      let errorMessage = error.message;
      if (error.message.includes('Extension context invalidated')) {
        errorMessage = 'Extension was updated. Please refresh this page to reconnect your wallet.';
      }
      
      window.postMessage({
        type: payload.type + '_RESPONSE',
        id: payload.id,
        response: { success: false, error: errorMessage },
        token: trustedToken,
      }, '*');
    }
  }
});

// Listen for network changes from background
browser.runtime.onMessage.addListener((message: any) => {
  try {
  if (!browser.runtime?.id) {
  // console.warn('⚠️ Extension context invalidated, skipping network change notification');
      return;
    }
    
    if (message.type === 'NETWORK_CHANGED') {
      if (!trustedToken) {
  // console.warn('⚠️ Network change received before handshake; ignoring');
        return;
      }
      window.postMessage({
        type: 'DEVNET_WALLET_NETWORK_CHANGED',
        network: message.network,
        token: trustedToken,
      }, '*');
    }
  } catch (_error) {
  // console.error('❌ Error handling background message:', _error);
  }
});

export {};
