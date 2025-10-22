# 🚀 Deploy Solana Hello World to Devnet

## Your Wallet Keypair
Your keypair has been generated and saved as `my-wallet-keypair.json`

**Public Key:** You can get this by running:
```bash
solana-keygen pubkey my-wallet-keypair.json
```

## Quick Deployment Steps

### Option 1: Using Solana Playground (Easiest - No Installation!)

1. **Go to Solana Playground**
   - Visit: https://beta.solpg.io/

2. **Import Your Wallet**
   - Click wallet icon (bottom left)
   - Click "Import Wallet"
   - Upload your `my-wallet-keypair.json` file
   
3. **Get Devnet SOL**
   - Click "Airdrop" button
   - Request 2 SOL

4. **Create Hello World Program**
   - Create new project: "Native" template
   - Replace `src/lib.rs` with:
   ```rust
   use solana_program::{
       account_info::AccountInfo,
       entrypoint,
       entrypoint::ProgramResult,
       msg,
       pubkey::Pubkey,
   };

   entrypoint!(process_instruction);

   pub fn process_instruction(
       _program_id: &Pubkey,
       _accounts: &[AccountInfo],
       _instruction_data: &[u8],
   ) -> ProgramResult {
       msg!("Hello, Solana Devnet! 🚀");
       Ok(())
   }
   ```

5. **Build & Deploy**
   - Click Build (🔨 icon)
   - Click Deploy
   - Save the Program ID!

6. **Test**
   - Click Test tab
   - Run test to see "Hello, Solana Devnet! 🚀" in logs

---

### Option 2: Install Solana CLI (For Advanced Users)

If you want to use command line:

**Install Solana CLI:**
```powershell
# Using Chocolatey
choco install solana

# Or download from: https://docs.solana.com/cli/install-solana-cli-tools
```

**Configure for Devnet:**
```bash
solana config set --url https://api.devnet.solana.com
solana config set --keypair ./my-wallet-keypair.json
```

**Get Your Address:**
```bash
solana address
```

**Get Devnet SOL:**
```bash
solana airdrop 2
```

**Deploy Program:**
```bash
# Build (requires Rust)
cargo build-bpf

# Deploy
solana program deploy target/deploy/hello_world.so
```

---

## 🎯 Recommended: Use Solana Playground

For quickest deployment without any installation, use **Option 1** (Solana Playground).

Ready to deploy? Open https://beta.solpg.io/ now! 🚀
