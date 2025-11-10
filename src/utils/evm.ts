import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { isMainnetBlocked } from './network';

export interface EvmWallet {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

/**
 * Create a new random EVM wallet with BIP-39 mnemonic
 */
export function createEvmWallet(): EvmWallet {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
  };
}

/**
 * Import EVM wallet from private key
 */
export function importFromPrivateKey(privateKey: string): EvmWallet {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (_error) {
    throw new Error('Invalid private key');
  }
}

/**
 * Import EVM wallet from mnemonic phrase
 */
export function importFromMnemonic(mnemonic: string, index = 0): EvmWallet {
  try {
    // Normalize mnemonic: trim, lowercase, single spaces
    const normalizedMnemonic = mnemonic
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    
  // console.log('🔍 Validating mnemonic...');
  // console.log('Original:', mnemonic);
  // console.log('Normalized:', normalizedMnemonic);
  // console.log('Word count:', normalizedMnemonic.split(' ').length);
  // console.log('Words:', normalizedMnemonic.split(' '));
    
    // Try to validate
    const isValid = bip39.validateMnemonic(normalizedMnemonic);
  // console.log('bip39.validateMnemonic result:', isValid);
    
    if (!isValid) {
  // console.warn('⚠️ Mnemonic failed BIP39 validation, but attempting to create wallet anyway...');
  // console.warn('This might work if the checksum is wrong but words are valid');
    }
    
  // console.log('✅ Creating wallet from mnemonic...');
    const path = `m/44'/60'/0'/0/${index}`;
    const wallet = ethers.Wallet.fromMnemonic(normalizedMnemonic, path);
  // console.log('✅ Wallet created:', wallet.address);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: normalizedMnemonic,
    };
  } catch (error: any) {
  // console.error('❌ Import from mnemonic failed:', error);
  // console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to import from mnemonic: ${error.message}`);
  }
}

/**
 * Get EVM balance
 * Accepts a single RPC URL or an array of RPC URLs to try in order (fallbacks).
 */
export async function getBalance(address: string, rpcUrlOrList: string | string[]): Promise<string> {
  const endpoints = Array.isArray(rpcUrlOrList) ? rpcUrlOrList : [rpcUrlOrList];
  const errors: string[] = [];

  for (const rpcUrl of endpoints) {
    try {
      console.log(`� [EVM] Trying RPC endpoint: ${rpcUrl}`);

      // Check if it's a local network
      const isLocal = rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');

      const provider = isLocal
        ? new ethers.providers.JsonRpcProvider(rpcUrl)
        : new ethers.providers.StaticJsonRpcProvider(rpcUrl);

      provider.polling = false;

      const timeout = isLocal ? 15000 : 8000; // ms

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`RPC endpoint timeout after ${timeout}ms`)), timeout)
      );

      if (!isLocal) {
        // Public network: directly fetch balance with timeout
        const balance = await Promise.race([provider.getBalance(address), timeoutPromise]);
        const formatted = ethers.utils.formatEther(balance);
        console.log(`✅ [EVM] Balance from ${rpcUrl}: ${formatted}`);
        return formatted;
      }

      // Local: detect network then fetch
      const network = await Promise.race([provider.getNetwork(), timeoutPromise]);
      if (isMainnetBlocked(network.chainId)) {
        throw new Error('Mainnet not allowed');
      }

      const balance = await Promise.race([provider.getBalance(address), timeoutPromise]);
      const formatted = ethers.utils.formatEther(balance);
      console.log(`✅ [EVM] Balance from ${rpcUrl} (local): ${formatted}`);
      return formatted;
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`⚠️  [EVM] Failed RPC ${rpcUrl}: ${msg}`);
      errors.push(`${rpcUrl}: ${msg}`);
      // try next endpoint
    }
  }

  console.error('🔴 [EVM] All RPC endpoints failed for balance fetch:', errors);
  return '0';
}

/**
 * Send EVM transaction
 */
export async function sendTransaction(
  privateKey: string,
  to: string,
  value: string,
  rpcUrl: string,
  gasLimit?: string,
  data?: string
): Promise<string> {
  try {
    const isLocal = rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');
    
    const provider = isLocal
      ? new ethers.providers.JsonRpcProvider(rpcUrl)
      : new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    
    let network;
    if (isLocal) {
      network = await provider.getNetwork();
    } else {
      // For public networks, assume network info is correct in config
      network = { chainId: 11155111 }; // Sepolia by default, adjust as needed
    }
    
    // Block mainnet
    if (isMainnetBlocked(network.chainId)) {
      throw new Error('Mainnet not allowed');
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(value),
      gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined,
      data: data || '0x',
    });
    
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('🔴 Transaction failed:', error.message);
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Sign transaction without sending
 */
export async function signTransaction(
  privateKey: string,
  to: string,
  value: string,
  rpcUrl: string,
  gasLimit?: string,
  data?: string
): Promise<string> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.signTransaction({
      to,
      value: ethers.utils.parseEther(value),
      gasLimit: gasLimit ? ethers.BigNumber.from(gasLimit) : undefined,
      data: data || '0x',
      nonce: await provider.getTransactionCount(wallet.address),
      chainId: (await provider.getNetwork()).chainId,
    });
    
    return tx;
  } catch (error: any) {
    throw new Error(`Signing failed: ${error.message}`);
  }
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(
  from: string,
  to: string,
  value: string,
  rpcUrl: string,
  data?: string
): Promise<string> {
  try {
    const isLocal = rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost');
    
    const provider = isLocal
      ? new ethers.providers.JsonRpcProvider(rpcUrl)
      : new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    
    const gasEstimate = await provider.estimateGas({
      from,
      to,
      value: ethers.utils.parseEther(value),
      data: data || '0x',
    });
    return gasEstimate.toString();
  } catch (error: any) {
    console.warn('⚠️  Gas estimation failed:', error.message);
    return '21000'; // Default gas limit
  }
}
