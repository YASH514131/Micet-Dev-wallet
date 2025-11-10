export interface NetworkConfig {
  name: string;
  type: 'EVM' | 'Solana';
  chainId?: number;
  clusterId?: string;
  rpcUrl: string;
  // Optional list of RPC endpoints to try (fallbacks). First entry kept in rpcUrl for compatibility.
  rpcUrls?: string[];
  explorerUrl: string;
  faucetUrl?: string;
  symbol: string;
  decimals: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    name: 'Ethereum Sepolia',
    type: 'EVM',
    chainId: 11155111,
    // Primary RPC URL: Alchemy's free public endpoint (no API key required, reliable)
    // Note: If you still get timeout errors, you can:
    //   - Get a FREE API key from Alchemy.com and use: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
    //   - Or paste any custom RPC URL in Wallet Settings → Custom RPC URL
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    rpcUrls: [
      'https://eth-sepolia.g.alchemy.com/v2/demo',
      'https://rpc.ankr.com/eth_sepolia',
      'https://rpc.sepolia.publicnode.com',
      'https://rpc.sepolia.org'
    ],
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com',
    symbol: 'ETH',
    decimals: 18,
  },
  polygonAmoy: {
    name: 'Polygon Amoy',
    type: 'EVM',
    chainId: 80002,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    faucetUrl: 'https://faucet.polygon.technology',
    symbol: 'MATIC',
    decimals: 18,
  },
  bscTestnet: {
    name: 'BSC Testnet',
    type: 'EVM',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    faucetUrl: 'https://testnet.binance.org/faucet-smart',
    symbol: 'BNB',
    decimals: 18,
  },
  fuji: {
    name: 'Avalanche Fuji',
    type: 'EVM',
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    faucetUrl: 'https://faucet.avax.network',
    symbol: 'AVAX',
    decimals: 18,
  },
  hardhat: {
    name: 'Local Hardhat / Anvil',
    type: 'EVM',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    faucetUrl: 'local',
    symbol: 'ETH',
    decimals: 18,
  },
  solanaDevnet: {
    name: 'Solana Devnet',
    type: 'Solana',
    clusterId: 'devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com?cluster=devnet',
    faucetUrl: 'https://faucet.solana.com',
    symbol: 'SOL',
    decimals: 9,
  },
};

export const BLOCKED_CHAIN_IDS = [1, 137, 56]; // Ethereum, Polygon, BSC mainnets
export const BLOCKED_CLUSTERS = ['mainnet-beta'];

export function isMainnetBlocked(chainId?: number, cluster?: string): boolean {
  if (chainId && BLOCKED_CHAIN_IDS.includes(chainId)) {
    return true;
  }
  if (cluster && BLOCKED_CLUSTERS.includes(cluster)) {
    return true;
  }
  return false;
}

export function getNetworkById(id: string): NetworkConfig | undefined {
  return NETWORKS[id];
}

export function getAllNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}
