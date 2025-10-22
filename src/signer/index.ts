// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && (window as any).browser ? (window as any).browser : chrome;
import { ethers } from 'ethers';

const SEPOLIA_RPC_URLS = [
  'https://sepolia.gateway.tenderly.co',
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
  'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
];

const abiCoder = new ethers.utils.AbiCoder();

function decodeRevertReason(data?: string | null): string | null {
  if (!data || typeof data !== 'string') {
    return null;
  }

  if (data.startsWith('{')) {
    try {
      const parsed = JSON.parse(data);
      return decodeRevertReason(parsed?.data);
    } catch {
      return null;
    }
  }

  const cleanData = data.startsWith('0x') ? data : `0x${data}`;
  if (cleanData === '0x' || cleanData.length < 10) {
    return null;
  }

  // Standard Error(string) selector
  if (cleanData.slice(0, 10) === '0x08c379a0') {
    try {
      const [reason] = abiCoder.decode(['string'], `0x${cleanData.slice(10)}`);
      return reason;
    } catch {
      return null;
    }
  }

  // Panic(uint256) selector
  if (cleanData.slice(0, 10) === '0x4e487b71') {
    try {
      const [code] = abiCoder.decode(['uint256'], `0x${cleanData.slice(10)}`);
      return `Panic code 0x${code.toHexString().slice(2).padStart(4, '0')}`;
    } catch {
      return 'Solidity panic';
    }
  }

  return null;
}

// console.log('🔐 Transaction signer loaded and ready');

// Notify background that we're ready and wait for transaction
window.addEventListener('load', async () => {
  // console.log('🔐 Signer window fully loaded, waiting for transaction...');
  
  // Listen for transaction from background via storage
  const checkForTransaction = async () => {
  const result = await browser.storage.local.get(['pendingSignerTransaction']);
    
    if (result.pendingSignerTransaction) {
  // console.log('📨 Received transaction to sign:', result.pendingSignerTransaction);
      const { transaction, privateKey, requestId } = result.pendingSignerTransaction;
      
      // Clear the pending transaction
  await browser.storage.local.remove(['pendingSignerTransaction']);
      
      try {
  // console.log('🔐 Signing and sending transaction...');
        
        // Try each RPC endpoint
        for (const rpcUrl of SEPOLIA_RPC_URLS) {
          try {
            // console.log(`📡 Trying RPC: ${rpcUrl}`);
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            
            // Prepare transaction object
            const tx: any = {
              to: transaction.to,
              value: transaction.value || '0x0',
              data: transaction.data || '0x',
            };
            
            // Add gas parameters
            if (transaction.gas || transaction.gasLimit) {
              tx.gasLimit = transaction.gas || transaction.gasLimit;
            }
            
            if (transaction.gasPrice) {
              tx.gasPrice = transaction.gasPrice;
            } else if (transaction.maxFeePerGas) {
              tx.maxFeePerGas = transaction.maxFeePerGas;
              if (transaction.maxPriorityFeePerGas) {
                tx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
              }
            }
            
            // console.log('📤 Sending transaction:', tx);
            const sentTx = await wallet.sendTransaction(tx);
            // console.log('✅ Transaction broadcasted!', sentTx.hash);

            let receipt;
            try {
              // Wait up to 60 seconds for the network to mine the tx
              receipt = await provider.waitForTransaction(sentTx.hash, 1, 60000);
            } catch (_waitError: any) {
              // console.warn('⌛ Transaction not yet confirmed:', _waitError?.message || _waitError);
            }

            if (!receipt) {
              await browser.storage.local.set({
                [`signerResult_${requestId}`]: {
                  success: true,
                  hash: sentTx.hash,
                  pending: true,
                }
              });
              // console.log('ℹ️ Transaction still pending, result stored.');
              window.close();
              return;
            }

            if (receipt.status === 1) {
              await browser.storage.local.set({
                [`signerResult_${requestId}`]: {
                  success: true,
                  hash: sentTx.hash,
                }
              });
              // console.log('✅ Transaction mined successfully.');
              window.close();
              return;
            }

            let revertMessage = 'Transaction reverted on-chain. Please review the contract logic or see the explorer for details.';
            try {
              const callTx: ethers.providers.TransactionRequest = {
                to: tx.to,
                data: tx.data,
                from: wallet.address,
                value: tx.value,
                gasLimit: tx.gasLimit,
              };
              const callResult = await provider.call(callTx, receipt.blockNumber);
              const decoded = decodeRevertReason(callResult);
              if (decoded) {
                revertMessage = `Transaction reverted: ${decoded}`;
              }
            } catch (callError: any) {
              const data = callError?.error?.data || callError?.data || callError?.body;
              const decoded = decodeRevertReason(data);
              if (decoded) {
                revertMessage = `Transaction reverted: ${decoded}`;
              }
            }

            await browser.storage.local.set({
              [`signerResult_${requestId}`]: {
                success: false,
                hash: sentTx.hash,
                error: revertMessage,
              }
            });
            // console.warn('❌ Transaction reverted:', revertMessage);
            window.close();
            return;
          } catch (_error: any) {
            // console.warn(`❌ Failed with ${rpcUrl}:`, _error.message);
            // Try next endpoint
            continue;
          }
        }
        
        // All endpoints failed
  // console.error('❌ All RPC endpoints failed');
  await browser.storage.local.set({
          [`signerResult_${requestId}`]: {
            success: false,
            error: 'All RPC endpoints failed to send transaction',
          }
        });
        window.close();
      } catch (error: any) {
  // console.error('❌ Transaction signing error:', error);
  await browser.storage.local.set({
          [`signerResult_${requestId}`]: {
            success: false,
            error: error.message,
          }
        });
        window.close();
      }
    }
  };
  
  // Check immediately and then poll every 100ms
  checkForTransaction();
  const interval = setInterval(checkForTransaction, 100);
  
  // Stop polling after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
  // console.log('⏱️ Signer timeout after 30 seconds, closing...');
    window.close();
  }, 30000);
});

// console.log('✅ Transaction signer initialized');
