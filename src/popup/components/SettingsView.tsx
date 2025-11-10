import React, { useState } from 'react';
import { WalletState } from '../Popup';
import { clearAllData, storeEncrypted } from '../../utils/storage';
import { exportSecretKey } from '../../utils/solana';

interface SettingsViewProps {
  wallet: WalletState;
  onClearWallet: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ wallet, onClearWallet }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [encryptPassword, setEncryptPassword] = useState('');
  const [showEncrypt, setShowEncrypt] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [showCustomRpc, setShowCustomRpc] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');

  // console.log('SettingsView rendered', { wallet, showKeys });

  const handleExportKeys = () => {
  // console.log('handleExportKeys clicked', showKeys);
    if (!showKeys) {
      const confirmed = confirm(
  '⚠️ WARNING: Only export devnet keys!\n\nNever share these keys or use them on mainnet.\n\nDo you want to continue?'
      );
  // console.log('User confirmed:', confirmed);
      if (!confirmed) return;
      setShowKeys(true);
    } else {
      setShowKeys(false);
    }
  };

  const handleEncryptWallet = async () => {
    if (!encryptPassword || encryptPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      await storeEncrypted({
        evmPrivateKey: wallet.evmPrivateKey,
        evmMnemonic: wallet.evmMnemonic,
        solanaSecretKey: JSON.stringify(Array.from(wallet.solanaSecretKey)),
        selectedNetwork: wallet.selectedNetwork,
        encryptionEnabled: true,
      }, encryptPassword);

      alert('✓ Wallet encrypted and saved successfully!');
      setShowEncrypt(false);
      setEncryptPassword('');
    } catch (_error) {
      alert('Failed to encrypt wallet. Please try again.');
    }
  };

  const handleClearWallet = () => {
    const confirmed = confirm(
      '⚠️ Are you sure you want to clear your wallet?\n\nThis will remove all stored data. Make sure you have backed up your keys if needed.'
    );
    
    if (confirmed) {
      clearAllData();
      onClearWallet();
    }
  };

  const handleDownloadSolanaKeypair = () => {
    const confirmed = confirm(
  '⚠️ DEVNET ONLY\n\nThis will download your Solana secret key as a JSON file. Keep it safe and never upload it to mainnet tools. Continue?'
    );

    if (!confirmed) return;

    try {
      const keypairArray = Array.from(wallet.solanaSecretKey || []);

      if (!keypairArray.length) {
        alert('Solana secret key not found. Please re-open the wallet.');
        return;
      }

      const contents = JSON.stringify(keypairArray, null, 2);
      const blob = new Blob([contents], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'solana-wallet-keypair.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      alert('Solana keypair downloaded (solana-wallet-keypair.json)');
    } catch (_error) {
  // console.error('Failed to export Solana keypair', _error);
      alert('Failed to download Solana keypair. Please try again.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const handleSetCustomRpc = async () => {
    if (!customRpcUrl.trim()) {
      alert('Please enter a valid RPC URL');
      return;
    }
    try {
      await (await import('../../utils/storage')).setCustomRpcUrl(selectedNetwork, customRpcUrl);
      alert(`✓ Custom RPC saved for ${selectedNetwork}`);
      setCustomRpcUrl('');
      setShowCustomRpc(false);
    } catch (error: any) {
      alert(`Failed to save custom RPC: ${error.message}`);
    }
  };

  const handleClearCustomRpc = async () => {
    try {
      await (await import('../../utils/storage')).clearCustomRpcUrl(selectedNetwork);
      alert(`✓ Custom RPC cleared for ${selectedNetwork}`);
    } catch (error: any) {
      alert(`Failed to clear custom RPC: ${error.message}`);
    }
  };

  if (!wallet) {
    return <div className="p-6 text-slate-100">Loading wallet...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Settings</h2>

      {/* Wallet Info */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Wallet Information</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">EVM Address</p>
            <div className="flex gap-2">
              <p className="flex-1 text-sm text-slate-100 font-mono break-all bg-slate-900 px-3 py-2 rounded">
                {wallet.evmAddress}
              </p>
              <button
                onClick={() => copyToClipboard(wallet.evmAddress, 'EVM Address')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                📋
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-1">Solana Public Key</p>
            <div className="flex gap-2">
              <p className="flex-1 text-sm text-slate-100 font-mono break-all bg-slate-900 px-3 py-2 rounded">
                {wallet.solanaPublicKey}
              </p>
              <button
                onClick={() => copyToClipboard(wallet.solanaPublicKey, 'Solana Public Key')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Keys */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Export Keys</h3>
        
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-4">
          <p className="text-red-300 text-sm">
            ⚠️ <strong>DEVNET ONLY</strong> - Never export or use mainnet keys in this wallet!
          </p>
        </div>

        <button
          onClick={handleExportKeys}
          className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl transition-all mb-4"
        >
          {showKeys ? 'Hide Keys' : 'Show Private Keys'}
        </button>

        {showKeys && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">EVM Private Key</p>
                <button
                  onClick={() => copyToClipboard(wallet.evmPrivateKey, 'EVM Private Key')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={wallet.evmPrivateKey}
                readOnly
                className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-slate-700 resize-none"
                rows={2}
              />
            </div>

            {wallet.evmMnemonic && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-300">EVM Mnemonic</p>
                  <button
                    onClick={() => copyToClipboard(wallet.evmMnemonic!, 'EVM Mnemonic')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  value={wallet.evmMnemonic}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-slate-700 resize-none"
                  rows={3}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-300">Solana Secret Key (Base64)</p>
                <button
                  onClick={() => copyToClipboard(exportSecretKey(wallet.solanaSecretKey), 'Solana Secret Key')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
              <textarea
                value={exportSecretKey(wallet.solanaSecretKey)}
                readOnly
                className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded border border-slate-700 resize-none"
                rows={4}
              />
            </div>

            <button
              onClick={handleDownloadSolanaKeypair}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
            >
              Download Solana Keypair (.json)
            </button>
          </div>
        )}
      </div>

      {/* Encrypt Wallet */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Persist Wallet (Encrypted)</h3>
        
        <p className="text-sm text-slate-400 mb-4">
          By default, your keys are stored in memory and wiped when you close the browser.
          You can encrypt and save your wallet with a password to persist it.
        </p>

        {!showEncrypt ? (
          <button
            onClick={() => setShowEncrypt(true)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
          >
            Encrypt & Save Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Encryption Password (min 8 characters)
              </label>
              <input
                type="password"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEncryptWallet}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowEncrypt(false);
                  setEncryptPassword('');
                }}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-blue-900/50">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">Custom RPC (Advanced)</h3>
        
        <p className="text-sm text-slate-400 mb-4">
          If balance fetching is timing out, provide your own RPC endpoint. Get a free endpoint from:
        </p>
        <ul className="text-xs text-slate-400 list-disc list-inside mb-4 space-y-1">
          <li><strong>Infura</strong>: <code className="bg-slate-900 px-1">https://sepolia.infura.io/v3/YOUR_API_KEY</code></li>
          <li><strong>Alchemy</strong>: <code className="bg-slate-900 px-1">https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY</code></li>
          <li><strong>QuickNode</strong>: <code className="bg-slate-900 px-1">https://YOUR_ENDPOINT.quiknode.pro/</code></li>
          <li><strong>BlockPI</strong>: Free at <code className="bg-slate-900 px-1">https://rpc.sepolia.blockpi.network/v1/rpc/public</code></li>
        </ul>

        {!showCustomRpc ? (
          <button
            onClick={() => setShowCustomRpc(true)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
          >
            Set Custom RPC
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Network
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sepolia">Ethereum Sepolia</option>
                <option value="polygonAmoy">Polygon Amoy</option>
                <option value="bscTestnet">BSC Testnet</option>
                <option value="fuji">Avalanche Fuji</option>
                <option value="hardhat">Local Hardhat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                RPC URL
              </label>
              <input
                type="text"
                value={customRpcUrl}
                onChange={(e) => setCustomRpcUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSetCustomRpc}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setShowCustomRpc(false)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={handleClearCustomRpc}
              className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-xl transition-all border border-red-600/50"
            >
              Clear Custom RPC
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-800 rounded-xl p-6 border-2 border-red-900/50">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        
        <button
          onClick={handleClearWallet}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
        >
          Clear Wallet & All Data
        </button>
        
        <p className="text-xs text-slate-400 mt-2">
          This will remove all wallet data from storage. Make sure to backup your keys first!
        </p>
      </div>

      {/* About */}
      <div className="mt-8 text-center text-sm text-slate-500">
  <p>DevNet Wallet v1.0.0</p>
  <p className="mt-1">Developer tool for devnet/test networks only • MIT License</p>
      </div>
    </div>
  );
};
