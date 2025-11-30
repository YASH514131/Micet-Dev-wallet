import React, { useState, useEffect } from 'react';
import { WalletState } from '../Popup';
import { NETWORKS } from '../../utils/network';
import { getBalance as getEvmBalance } from '../../utils/evm';
import { getBalance as getSolanaBalance, requestAirdrop } from '../../utils/solana';
import { handleFaucetRequest, getFaucetButtonText } from '../../utils/faucet';
import { getCustomRpcUrl } from '../../utils/storage';

interface WalletViewProps {
  wallet: WalletState;
  onNetworkChange: (network: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ wallet, onNetworkChange }) => {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCustomRpc, setIsUsingCustomRpc] = useState(false);
  const [currentRpcUrl, setCurrentRpcUrl] = useState<string>('');
  
  const currentNetwork = NETWORKS[wallet.selectedNetwork];
  const isEvm = currentNetwork?.type === 'EVM';
  const currentAddress = isEvm ? wallet.evmAddress : wallet.solanaPublicKey;

  // Check if custom RPC is being used
  useEffect(() => {
    const checkCustomRpc = async () => {
      const customRpc = await getCustomRpcUrl(wallet.selectedNetwork);
      if (customRpc) {
        setIsUsingCustomRpc(true);
        setCurrentRpcUrl(customRpc);
      } else {
        setIsUsingCustomRpc(false);
        setCurrentRpcUrl(currentNetwork?.rpcUrl || '');
      }
    };
    
    checkCustomRpc();
  }, [wallet.selectedNetwork, currentNetwork?.rpcUrl]);

  // Auto-refresh balance every 10 seconds and on network change
  useEffect(() => {
    // Initial fetch
    setBalance('0'); // Reset balance
    setError(null); // Reset error
    fetchBalance();
    
    // Auto-refresh every 10 seconds
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing balance for', wallet.selectedNetwork);
      fetchBalance();
    }, 10000); // 10 seconds
    
    return () => clearInterval(autoRefreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.selectedNetwork, currentAddress]);

  const fetchBalance = async () => {
    if (!currentNetwork) {
      console.warn('⚠️  No network selected');
      setError('No network selected');
      return;
    }
    
    console.log('📊 Fetching balance from', currentNetwork.name, '- RPC:', currentNetwork.rpcUrl);
    
    setLoading(true);
    setError(null);
    
    try {
      // Check for custom RPC URL for THIS network
      const customRpc = await getCustomRpcUrl(wallet.selectedNetwork);
      const rpcToUse = customRpc || (currentNetwork.rpcUrls ?? currentNetwork.rpcUrl);
      
      if (customRpc) {
        console.log('🔗 Using custom RPC for', wallet.selectedNetwork, ':', customRpc);
      } else {
        console.log('📍 Using default RPC endpoints for', wallet.selectedNetwork);
      }
      
      // Set a timeout for the entire balance fetch operation
      const timeoutMs = 12000; // 12 seconds total timeout
      
        const balancePromise = isEvm
          ? getEvmBalance(wallet.evmAddress, rpcToUse)
        : getSolanaBalance(wallet.solanaPublicKey, currentNetwork.rpcUrl);
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Balance fetch timeout - RPC endpoint not responding')), timeoutMs)
      );
      
      const bal = await Promise.race([balancePromise, timeoutPromise]);
      console.log('✅ Balance received:', bal);
      setBalance(bal || '0');
    } catch (error: any) {
      console.error('❌ Failed to fetch balance:', error.message);
      
      // Provide helpful error messages
      if (error.message?.includes('timeout')) {
        setError('⏱️ RPC endpoint timeout - try refreshing or switching networks');
      } else if (error.message?.includes('Mainnet not allowed')) {
        setError('❌ Mainnet access blocked - use testnets only');
      } else {
        setError(error.message || 'Failed to fetch balance');
      }
      
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleFaucet = async () => {
    if (!currentNetwork) return;
    
    try {
      if (currentNetwork.type === 'Solana') {
        setLoading(true);
        const signature = await requestAirdrop(wallet.solanaPublicKey, currentNetwork.rpcUrl);
        alert(`Airdrop successful! Signature: ${signature.slice(0, 20)}...`);
        await fetchBalance();
      } else {
        const result = await handleFaucetRequest(currentNetwork, currentAddress);
        if (result.success) {
          alert(result.message);
          if (currentNetwork.faucetUrl === 'local') {
            await fetchBalance();
          }
        } else {
          alert(result.message);
        }
      }
    } catch (error: any) {
      alert(`Faucet request failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Network Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Select Network
        </label>
        <select
          value={wallet.selectedNetwork}
          onChange={(e) => onNetworkChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(NETWORKS).map(([key, network]) => (
            <option key={key} value={key}>
              {network.name} ({network.type})
            </option>
          ))}
        </select>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-slate-400 text-sm">Total Balance</p>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isUsingCustomRpc 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                : 'bg-blue-900/50 text-blue-300 border border-blue-700'
            }`}>
              {isUsingCustomRpc ? '⚙️ Custom RPC' : '📍 Default RPC'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <p className="text-4xl font-bold text-slate-100">
              {loading ? '...' : (balance && !isNaN(parseFloat(balance)) ? parseFloat(balance).toFixed(4) : '0.0000')}
            </p>
            <span className="text-2xl text-slate-400">{currentNetwork?.symbol}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentNetwork?.name}
          </p>
          {error && (
            <p className="text-xs text-red-400 mt-2">
              ⚠️ {error}
            </p>
          )}
          {currentNetwork?.rpcUrl.includes('127.0.0.1') && balance === '0' && !loading && (
            <p className="text-xs text-yellow-400 mt-2">
              💡 Local node not running? Start with: <code className="bg-slate-700 px-1 rounded">npx hardhat node</code>
            </p>
          )}
          <button
            onClick={fetchBalance}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh Balance'}
          </button>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-300">Your Address</p>
          <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
            {currentNetwork?.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm text-slate-100 font-mono break-all">
            {currentAddress}
          </p>
          <button
            onClick={copyAddress}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors shrink-0"
            title="Copy address"
          >
            {copiedAddress ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleFaucet}
          disabled={loading}
          className="py-4 px-6 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg"
        >
          💧 {getFaucetButtonText(currentNetwork)}
        </button>
        <button
          onClick={() => window.open(currentNetwork?.explorerUrl, '_blank')}
          className="py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
        >
          🔍 Explorer
        </button>
      </div>

      {/* Network Info */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Network Info</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Chain/Cluster ID:</span>
            <span className="text-slate-200 font-mono">
              {currentNetwork?.chainId || currentNetwork?.clusterId}
            </span>
          </div>
          <div className="flex justify-between items-start gap-2">
            <span className="text-slate-400">Current RPC:</span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-slate-200 font-mono truncate max-w-[200px] text-right" title={currentRpcUrl}>
                {currentRpcUrl}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                isUsingCustomRpc 
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-700' 
                  : 'bg-blue-900/50 text-blue-300 border border-blue-700'
              }`}>
                {isUsingCustomRpc ? '⚙️ Custom' : '📍 Default'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
