# 🚰 Testnet Faucet Guide

## Working Faucets for Each Network

### ✅ Ethereum Sepolia
- **Official Faucet**: https://sepoliafaucet.com
- **Alternatives**:
  - https://www.alchemy.com/faucets/ethereum-sepolia
  - https://sepolia-faucet.pk910.de
  - https://faucet.quicknode.com/ethereum/sepolia

### ✅ Polygon Amoy
- **Official Faucet**: https://faucet.polygon.technology
- **Alternatives**:
  - https://www.alchemy.com/faucets/polygon-amoy
  
### ✅ BSC Testnet
- **Official Faucet**: https://testnet.binance.org/faucet-smart
- **Alternatives**:
  - https://testnet.bnbchain.org/faucet-smart

### ✅ Avalanche Fuji
- **Official Faucet**: https://faucet.avax.network
- **Alternatives**:
  - https://core.app/tools/testnet-faucet

### ⚠️ Fantom Testnet (Opera)
**If faucet shows "Invalid Opera Testnet Address"**, try these alternatives:

#### Alternative Faucets:
1. **ChainLink Faucet**: https://faucets.chain.link/fantom-testnet
   - More reliable
   - Works with standard EVM addresses

2. **GetBlock Faucet**: https://getblock.io/faucet/ftm-testnet/
   
3. **Manual Format Fix**:
   - Copy your address
   - Try lowercase version: Use address in all lowercase
   - Some faucets are picky about address format

#### Why the Error Happens:
The official Fantom faucet has strict validation that sometimes rejects valid EVM addresses. Your address IS valid - it's just their website validation being too strict.

### ✅ Solana Devnet
- **Built-in Airdrop**: Click "Request Airdrop" in the wallet
- **Web Faucet**: https://faucet.solana.com
- **Alternatives**:
  - https://solfaucet.com

### ✅ Local Hardhat/Anvil
- **Built-in**: Click "Fund Wallet" to add 10 ETH automatically
- No external faucet needed

---

## 💡 Pro Tips

### If a Faucet Rejects Your Address:
1. ✅ **Try lowercase**: Convert your address to all lowercase
2. ✅ **Try alternative faucets**: Use the alternatives listed above
3. ✅ **Check format**: Most EVM addresses start with `0x` followed by 40 hex characters
4. ✅ **Use Discord/Twitter**: Many projects have Discord bots for faucets

### Rate Limits:
- Most faucets have rate limits (e.g., 1 request per 24 hours)
- Some require social verification (Twitter, Discord)
- Alternative faucets can help when one is rate-limited

### Best Practices:
- ✅ Bookmark working faucets
- ✅ Join project Discord servers for faucet access
- ✅ Use multiple alternative faucets if needed
- ✅ Request small amounts first to test

---

## 🔧 For Fantom Specifically

If you get "Invalid Opera Testnet Address!" error:

### Quick Fix:
1. Copy your address from the wallet
2. Convert to lowercase: `0xdBBed202Fb75adA434f70d138dB6a510B4eE9C8b` → `0xdbbed202fb75ada434f70d138db6a510b4ee9c8b`
3. Try pasting the lowercase version
4. **OR** use ChainLink faucet instead: https://faucets.chain.link/fantom-testnet

### Why This Works:
EVM addresses are case-insensitive for transactions, but some websites validate only specific formats. Fantom's faucet is known to be picky.

---

## 🆘 Still Having Issues?

1. Check if the faucet website is online
2. Try a different browser
3. Clear browser cache
4. Use alternative faucets
5. Check project Discord for faucet bot commands

---

**All addresses shown in the wallet are valid EVM or Solana addresses!** If a faucet rejects them, it's a problem with the faucet's validation, not your wallet.
