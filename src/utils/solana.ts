import { Keypair, Connection, Transaction, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';

export interface SolanaWallet {
  publicKey: string;
  secretKey: Uint8Array;
}

/**
 * Create a new random Solana wallet (Ed25519 keypair)
 */
export function createSolanaWallet(): SolanaWallet {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey,
  };
}

/**
 * Import Solana wallet from secret key (base58 or Uint8Array)
 */
export function importFromSecretKey(secretKey: string | Uint8Array): SolanaWallet {
  try {
    let secretKeyBytes: Uint8Array;
    
    if (typeof secretKey === 'string') {
      // Decode base64 string to Uint8Array
      const binaryString = atob(secretKey);
      secretKeyBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        secretKeyBytes[i] = binaryString.charCodeAt(i);
      }
    } else {
      secretKeyBytes = secretKey;
    }
    
    const keypair = Keypair.fromSecretKey(secretKeyBytes);
    return {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: keypair.secretKey,
    };
  } catch (_error) {
    throw new Error('Invalid Solana secret key');
  }
}

/**
 * Get Solana balance
 */
export async function getBalance(publicKey: string, rpcUrl: string): Promise<string> {
  try {
    // console.log(`[Solana] Connecting to: ${rpcUrl}`);
    // console.log(`[Solana] Public key: ${publicKey}`);
    
    // Block mainnet only if URL contains mainnet-beta
    if (rpcUrl.includes('mainnet-beta')) {
  // console.error('[Solana] Mainnet blocked!');
  throw new Error('Mainnet not allowed - use DevNet or test networks only');
    }
    
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubKey = new PublicKey(publicKey);
  // console.log(`[Solana] Fetching balance for: ${pubKey.toBase58()}`);
    
    const balance = await connection.getBalance(pubKey);
    const solBalance = (balance / LAMPORTS_PER_SOL).toString();
    
  // console.log(`[Solana] Balance in lamports: ${balance}`);
  // console.log(`[Solana] Balance in SOL: ${solBalance}`);
    
    return solBalance;
  } catch (_error) {
    // console.error('[Solana] Error fetching balance:', _error);
    return '0';
  }
}

/**
 * Send SOL transaction
 */
export async function sendTransaction(
  secretKey: Uint8Array,
  to: string,
  amount: string,
  rpcUrl: string
): Promise<string> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    
    // Block mainnet
    if (rpcUrl.includes('mainnet-beta')) {
      throw new Error('Mainnet not allowed');
    }
    
    const fromKeypair = Keypair.fromSecretKey(secretKey);
    const toPublicKey = new PublicKey(to);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
      })
    );
    
    const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error: any) {
    throw new Error(`Solana transaction failed: ${error.message}`);
  }
}

/**
 * Sign a Solana transaction
 */
export async function signTransaction(
  secretKey: Uint8Array,
  transaction: Transaction
): Promise<Transaction> {
  try {
    const keypair = Keypair.fromSecretKey(secretKey);
    transaction.partialSign(keypair);
    return transaction;
  } catch (error: any) {
    throw new Error(`Signing failed: ${error.message}`);
  }
}

/**
 * Request airdrop on devnet
 */
export async function requestAirdrop(publicKey: string, rpcUrl: string, amount = 1): Promise<string> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubKey = new PublicKey(publicKey);
    
    const signature = await connection.requestAirdrop(
      pubKey,
      amount * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error: any) {
    throw new Error(`Airdrop failed: ${error.message}`);
  }
}

/**
 * Export secret key as base64 (browser-compatible)
 */
export function exportSecretKey(secretKey: Uint8Array): string {
  // Convert Uint8Array to base64 using browser APIs
  let binary = '';
  for (let i = 0; i < secretKey.length; i++) {
    binary += String.fromCharCode(secretKey[i]);
  }
  return btoa(binary);
}
