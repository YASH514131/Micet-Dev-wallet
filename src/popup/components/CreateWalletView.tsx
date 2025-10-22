import React, { useState } from 'react';

interface CreateWalletViewProps {
  onCreateWallet: (password: string) => void;
  onImportWallet: (evmKey: string, solanaKey: string, password: string) => void;
  onUnlockWallet: (password: string) => void;
  mnemonic?: string;
  onMnemonicConfirmed?: () => void;
  hasExistingWallet?: boolean;
}

export const CreateWalletView: React.FC<CreateWalletViewProps> = ({ 
  onCreateWallet, 
  onImportWallet,
  onUnlockWallet,
  mnemonic,
  onMnemonicConfirmed,
  hasExistingWallet
}) => {
  const [mode, setMode] = useState<'create' | 'import' | 'unlock'>('create');
  const [evmKey, setEvmKey] = useState('');
  const [solanaKey, setSolanaKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = () => {
    if (!evmKey.trim() || !solanaKey.trim()) {
      alert('Please enter both EVM and Solana keys');
      return;
    }
    if (!password) {
      alert('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onImportWallet(evmKey.trim(), solanaKey.trim(), password);
  };

  const handleCreate = () => {
    if (!password) {
      alert('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    onCreateWallet(password);
  };

  const handleUnlock = () => {
    if (!password) {
      alert('Please enter your password');
      return;
    }
    onUnlockWallet(password);
  };

  // If mnemonic is provided, show the seed phrase screen
  if (mnemonic) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔑</div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Save Your Seed Phrase
            </h2>
            <p className="text-slate-400 text-sm">
              Write down these 12 words in order. You'll need them to recover your wallet.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm font-semibold mb-2">
              ⚠️ Important: Save this seed phrase!
            </p>
            <ul className="text-red-200 text-xs space-y-1">
              <li>• Never share it with anyone</li>
              <li>• Store it in a safe place</li>
              <li>• You cannot recover it later</li>
            </ul>
          </div>

          {/* Mnemonic Display */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-3">
              {mnemonic.split(' ').map((word, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-500 mb-1">{index + 1}</div>
                  <div className="text-sm font-mono text-slate-100">{word}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all mb-4"
          >
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>

          {/* Continue Button */}
          <button
            onClick={onMnemonicConfirmed}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            I've Saved My Seed Phrase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            DevNet Wallet
          </h2>
          <p className="text-slate-400 text-sm">
            Developer wallet for blockchain testing
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {hasExistingWallet && (
            <button
              onClick={() => setMode('unlock')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                mode === 'unlock'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Unlock
            </button>
          )}
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              mode === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setMode('import')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              mode === 'import'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Import
          </button>
        </div>

        {mode === 'unlock' ? (
          <div>
            <div className="bg-slate-900 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Welcome Back!
              </h3>
              <p className="text-sm text-slate-400">
                Enter your password to unlock your wallet
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            </div>

            <button
              onClick={handleUnlock}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              🔓 Unlock Wallet
            </button>
          </div>
        ) : mode === 'create' ? (
          <div>
            <div className="bg-slate-900 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Create New Wallet
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Generates EVM & Solana keypairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Encrypted and stored securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>DevNet only - safe for development</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Create Wallet
            </button>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  EVM Private Key or Mnemonic
                </label>
                <textarea
                  value={evmKey}
                  onChange={(e) => setEvmKey(e.target.value)}
                  placeholder="0x... or 12/24 word phrase"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Solana Secret Key (Base64)
                </label>
                <textarea
                  value={solanaKey}
                  onChange={(e) => setSolanaKey(e.target.value)}
                  placeholder="Base64 encoded secret key"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 mb-6">
              <p className="text-yellow-300 text-sm">
                ⚠️ Only import DevNet keys. Never use mainnet keys!
              </p>
            </div>

            <button
              onClick={handleImport}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Import Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
