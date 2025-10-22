// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && (window as any).browser ? (window as any).browser : chrome;
import React, { useState, useEffect } from 'react';
import { Header, WalletView, SettingsView, CreateWalletView } from './components';
import { getFromMemory, storeInMemory, hasEncryptedData, refreshSession, getRemainingSessionTime, clearMemory } from '../utils/storage';
import { createEvmWallet, importFromMnemonic, importFromPrivateKey } from '../utils/evm';
import { createSolanaWallet, importFromSecretKey } from '../utils/solana';

export type View = 'create' | 'wallet' | 'settings';

export interface WalletState {
  evmAddress: string;
  evmPrivateKey: string;
  evmMnemonic?: string;
  solanaPublicKey: string;
  solanaSecretKey: Uint8Array;
  selectedNetwork: string;
}

const Popup: React.FC = () => {
  const [view, setView] = useState<View>('create');
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMnemonic, setShowMnemonic] = useState<string | null>(null);
  const [hasExistingWallet, setHasExistingWallet] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, []);

  // Refresh session on any interaction
  useEffect(() => {
    if (wallet) {
      const handleInteraction = async () => {
        await refreshSession();
        await getRemainingSessionTime();
        // console.log('Session refreshed. Time remaining:', remaining, 'seconds');
      };

      // Refresh on mouse move, click, or keypress
      window.addEventListener('mousemove', handleInteraction);
      window.addEventListener('click', handleInteraction);
      window.addEventListener('keypress', handleInteraction);

      // Check session expiry every minute
      const interval = setInterval(async () => {
        const remaining = await getRemainingSessionTime();
        // console.log('Session check. Time remaining:', remaining, 'seconds');
        
        if (remaining <= 0) {
          // Session expired, lock wallet
          // console.log('Session expired! Locking wallet...');
          setWallet(null);
          setView('create');
          await clearMemory();
        }
      }, 60000); // Check every minute

      return () => {
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keypress', handleInteraction);
        clearInterval(interval);
      };
    }
  }, [wallet]);

  const initializeWallet = async () => {
    try {
      setLoading(true);
      
      // Check if wallet exists in memory (session)
      const memoryData = await getFromMemory();
      if (memoryData && memoryData.evmPrivateKey) {
  // console.log('Session found! Restoring wallet...');
        setWallet({
          evmAddress: memoryData.evmPrivateKey ? await getAddressFromKey(memoryData.evmPrivateKey) : '',
          evmPrivateKey: memoryData.evmPrivateKey,
          evmMnemonic: memoryData.evmMnemonic,
          solanaPublicKey: memoryData.solanaSecretKey ? await getSolanaAddress(memoryData.solanaSecretKey) : '',
          solanaSecretKey: memoryData.solanaSecretKey ? new Uint8Array(JSON.parse(memoryData.solanaSecretKey)) : new Uint8Array(),
          selectedNetwork: memoryData.selectedNetwork || 'sepolia',
        });
        setView('wallet');
        setLoading(false);
        return;
      }
      
  // console.log('No active session found');
      
      // Check if encrypted wallet exists
      const hasEncrypted = await hasEncryptedData();
      setHasExistingWallet(hasEncrypted);
      
      if (hasEncrypted) {
        // User needs to unlock wallet - show create view with unlock option
        setView('create');
      } else {
        // New user - show create wallet view
        setView('create');
      }
      
      setLoading(false);
    } catch (_error) {
      // console.error('Failed to initialize wallet:', _error);
      setLoading(false);
    }
  };

  const getAddressFromKey = async (privateKey: string): Promise<string> => {
    const { importFromPrivateKey } = await import('../utils/evm');
    const wallet = importFromPrivateKey(privateKey);
    return wallet.address;
  };

  const getSolanaAddress = async (secretKeyStr: string): Promise<string> => {
    const { importFromSecretKey } = await import('../utils/solana');
    const secretKey = new Uint8Array(JSON.parse(secretKeyStr));
    const wallet = importFromSecretKey(secretKey);
    return wallet.publicKey;
  };

  const handleCreateWallet = async (password: string) => {
    try {
      const evmWallet = createEvmWallet();
      const solanaWallet = createSolanaWallet();
      
      const newWallet: WalletState = {
        evmAddress: evmWallet.address,
        evmPrivateKey: evmWallet.privateKey,
        evmMnemonic: evmWallet.mnemonic,
        solanaPublicKey: solanaWallet.publicKey,
        solanaSecretKey: solanaWallet.secretKey,
        selectedNetwork: 'sepolia',
      };
      
      const walletData = {
        evmPrivateKey: evmWallet.privateKey,
        evmMnemonic: evmWallet.mnemonic,
        solanaSecretKey: JSON.stringify(Array.from(solanaWallet.secretKey)),
        selectedNetwork: 'sepolia',
      };
      
      // Store encrypted
      const { storeEncrypted } = await import('../utils/storage');
      await storeEncrypted(walletData, password);
      
      // Also store in memory (session)
      storeInMemory(walletData);
      
      // Store walletState for background script access
  await browser.storage.local.set({ 
        walletState: {
          evmAddress: evmWallet.address,
          solanaPublicKey: solanaWallet.publicKey,
        }
      });
      
      setWallet(newWallet);
      
      // Show mnemonic first if available
      if (evmWallet.mnemonic) {
        setShowMnemonic(evmWallet.mnemonic);
      } else {
        setView('wallet');
      }
    } catch (_error) {
      // console.error('Failed to create wallet:', _error);
      alert('Failed to create wallet. Please try again.');
    }
  };

  const handleMnemonicConfirmed = () => {
    setShowMnemonic(null);
    setView('wallet');
  };

  const handleUnlockWallet = async (password: string) => {
    try {
      const { getEncrypted } = await import('../utils/storage');
      const walletData = await getEncrypted(password);
      
      if (!walletData) {
        alert('Failed to decrypt wallet. Incorrect password.');
        return;
      }
      
      const evmAddress = await getAddressFromKey(walletData.evmPrivateKey!);
      const solanaPublicKey = await getSolanaAddress(walletData.solanaSecretKey!);
      
      const unlockedWallet: WalletState = {
        evmAddress,
        evmPrivateKey: walletData.evmPrivateKey!,
        evmMnemonic: walletData.evmMnemonic,
        solanaPublicKey,
        solanaSecretKey: new Uint8Array(JSON.parse(walletData.solanaSecretKey!)),
        selectedNetwork: walletData.selectedNetwork || 'sepolia',
      };
      
      // Store in memory for current session
      storeInMemory(walletData);
      
      // Also store walletState for background script access
  await browser.storage.local.set({ 
        walletState: {
          evmAddress,
          solanaPublicKey,
        }
      });
      
      setWallet(unlockedWallet);
      setView('wallet');
    } catch (_error) {
      // console.error('Failed to unlock wallet:', _error);
      alert('Failed to unlock wallet. Incorrect password.');
    }
  };

  const handleImportWallet = async (evmKey: string, solanaKey: string, password: string) => {
    try {
      // console.log('🔄 Starting wallet import...');
      
      let evmWallet;
      // Check if it's a mnemonic or private key
      if (evmKey.includes(' ')) {
       // console.log('📝 Importing from mnemonic...');
        evmWallet = importFromMnemonic(evmKey);
      } else {
       // console.log('🔑 Importing from private key...');
        evmWallet = importFromPrivateKey(evmKey);
      }
      
  // console.log('✅ EVM wallet imported:', evmWallet.address);
  // console.log('🔄 Importing Solana wallet...');
      const solanaWallet = importFromSecretKey(solanaKey);
      // console.log('✅ Solana wallet imported:', solanaWallet.publicKey);
      
      const newWallet: WalletState = {
        evmAddress: evmWallet.address,
        evmPrivateKey: evmWallet.privateKey,
        evmMnemonic: evmWallet.mnemonic,
        solanaPublicKey: solanaWallet.publicKey,
        solanaSecretKey: solanaWallet.secretKey,
        selectedNetwork: 'sepolia',
      };
      
      const walletData = {
        evmPrivateKey: evmWallet.privateKey,
        evmMnemonic: evmWallet.mnemonic,
        solanaSecretKey: JSON.stringify(Array.from(solanaWallet.secretKey)),
        selectedNetwork: 'sepolia',
      };
      
  // console.log('💾 Storing encrypted wallet...');
      // Store encrypted
      const { storeEncrypted } = await import('../utils/storage');
      await storeEncrypted(walletData, password);
      
  // console.log('💾 Storing in memory...');
      // Store in memory
      storeInMemory(walletData);
      
  // console.log('💾 Storing wallet state...');
      // Store walletState for background script access
  await browser.storage.local.set({ 
        walletState: {
          evmAddress: evmWallet.address,
          solanaPublicKey: solanaWallet.publicKey,
        }
      });
      
      // console.log('✅ Wallet import complete!');
      setWallet(newWallet);
      setView('wallet');
    } catch (error: any) {
      // console.error('❌ Failed to import wallet:', error);
      // console.error('Error details:', error.message, error.stack);
      alert(`Failed to import wallet: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen devnet-bg">
        <div className="devnet-muted-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen devnet-bg">
      <Header 
        view={view} 
        onViewChange={setView}
        selectedNetwork={wallet?.selectedNetwork || 'sepolia'}
      />
      
      {view === 'create' && (
        <CreateWalletView 
          onCreateWallet={handleCreateWallet}
          onImportWallet={handleImportWallet}
          onUnlockWallet={handleUnlockWallet}
          mnemonic={showMnemonic || undefined}
          onMnemonicConfirmed={handleMnemonicConfirmed}
          hasExistingWallet={hasExistingWallet}
        />
      )}
      
      {view === 'wallet' && wallet && (
        <WalletView 
          wallet={wallet}
          onNetworkChange={(network: string) => {
            setWallet({ ...wallet, selectedNetwork: network });
            storeInMemory({
              evmPrivateKey: wallet.evmPrivateKey,
              evmMnemonic: wallet.evmMnemonic,
              solanaSecretKey: JSON.stringify(Array.from(wallet.solanaSecretKey)),
              selectedNetwork: network,
            });
          }}
        />
      )}
      
      {view === 'settings' && wallet && (
        <SettingsView 
          wallet={wallet}
          onClearWallet={() => {
            setWallet(null);
            setView('create');
          }}
        />
      )}
    </div>
  );
};

export default Popup;
