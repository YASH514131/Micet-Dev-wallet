// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && (window as any).browser ? (window as any).browser : chrome;
import { NetworkConfig } from './network';

/**
 * Open faucet URL in new tab
 */
export function openFaucet(faucetUrl?: string): void {
  if (!faucetUrl) {
    // console.warn('No faucet URL available for this network');
    return;
  }
  
  if (faucetUrl === 'local') {
    // console.log('Local faucet - use built-in funding');
    return;
  }
  
  browser.tabs.create({ url: faucetUrl });
}

/**
 * Request tokens from local hardhat/anvil faucet
 */
export async function requestLocalFaucet(
  address: string,
  rpcUrl: string,
  amount = '10'
): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'hardhat_setBalance',
        params: [address, `0x${(parseInt(amount) * 1e18).toString(16)}`],
        id: 1,
      }),
    });
    
    const data = await response.json();
    return !data.error;
  } catch (_error) {
    // console.error('Local faucet request failed:', _error);
    return false;
  }
}

/**
 * Get faucet button text
 */
export function getFaucetButtonText(network: NetworkConfig): string {
  if (network.type === 'Solana') {
    return 'Request Airdrop';
  }
  if (network.faucetUrl === 'local') {
    return 'Fund Wallet (Local)';
  }
  return 'Get Test Tokens';
}

/**
 * Handle faucet request based on network type
 */
export async function handleFaucetRequest(
  network: NetworkConfig,
  address: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (network.type === 'Solana') {
      // For Solana, we'll handle this in the UI with the solana.requestAirdrop function
      return {
        success: true,
        message: 'Opening Solana faucet...',
      };
    }
    
    if (network.faucetUrl === 'local') {
      const success = await requestLocalFaucet(address, network.rpcUrl, '10');
      return {
        success,
        message: success ? 'Successfully funded wallet with 10 ETH' : 'Failed to fund wallet',
      };
    }
    
    // For other networks, open the faucet URL
    openFaucet(network.faucetUrl);
    return {
      success: true,
      message: 'Opening faucet in new tab...',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Faucet request failed: ${error.message}`,
    };
  }
}
