import { ethers } from 'ethers';

const SEPOLIA_RPC_URLS = [
  'https://sepolia.gateway.tenderly.co',
  'https://ethereum-sepolia.publicnode.com',
  'https://rpc.sepolia.org',
];

/**
 * Sign and send a transaction to Sepolia network
 */
export async function signAndSendTransaction(
  transaction: any,
  privateKey: string
): Promise<string> {
  try {
    // Try each RPC endpoint
    for (const rpcUrl of SEPOLIA_RPC_URLS) {
      try {
  // console.log(`🔄 Attempting to send transaction via ${rpcUrl}`);
        
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Prepare transaction
        const tx: any = {
          from: transaction.from,
          to: transaction.to,
          value: transaction.value || '0x0',
          data: transaction.data || '0x',
        };
        
        // Add gas parameters if provided
        if (transaction.gas || transaction.gasLimit) {
          tx.gasLimit = transaction.gas || transaction.gasLimit;
        }
        
        if (transaction.gasPrice) {
          tx.gasPrice = transaction.gasPrice;
        } else if (transaction.maxFeePerGas) {
          tx.maxFeePerGas = transaction.maxFeePerGas;
          tx.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || transaction.maxFeePerGas;
        }
        
        // Send transaction
  // console.log('📤 Sending transaction:', tx);
        const sentTx = await wallet.sendTransaction(tx);
  // console.log('✅ Transaction sent:', sentTx.hash);
        
        return sentTx.hash;
      } catch (_error: any) {
        // console.warn(`⚠️ Failed to send via ${rpcUrl}:`, _error.message);
        // Try next RPC
        continue;
      }
    }
    
    throw new Error('All RPC endpoints failed to send transaction');
  } catch (error: any) {
    // console.error('❌ Failed to sign and send transaction:', error);
    throw error;
  }
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(transaction: any): Promise<string> {
  for (const rpcUrl of SEPOLIA_RPC_URLS) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate.toHexString();
    } catch (_error) {
      // console.warn(`Failed to estimate gas via ${rpcUrl}`);
      continue;
    }
  }
  
  // Default gas limit if estimation fails
  return '0x' + (300000).toString(16); // 300k gas
}
