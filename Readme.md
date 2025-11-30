

# DevNet Wallet – Source Code Build Instructions

## Overview
DevNet Wallet is a browser extension for safe blockchain development and testing. It supports EVM and Solana test networks only.

## Build Environment
- **Operating System:** Ubuntu 24.04 LTS (or compatible Linux)
- **Node.js:** v22 LTS
- **npm:** v10
- **Tools:** TypeScript, Vite (bundler)

## Prerequisites
1. Install Node.js v22 LTS from [nodejs.org](https://nodejs.org/)
2. Install npm (comes with Node.js)

## Build Steps
1. Clone or extract the source code
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. The built extension will be in the `build/` directory

## Verification
- The build process generates identical output to the submitted extension
- All source files are in `src/`, `public/`, and root config files
- No obfuscated or proprietary code is used

## Notes
- This extension uses open-source tools: Vite, TypeScript, React
- No minification beyond standard bundling
- Source code is provided for full review and reproducibility

## Overview
DevNet Wallet is a browser extension designed for safe blockchain development and testing.  
It enables developers to interact with EVM and Solana test networks without risking mainnet assets.  
This project is intended strictly for **development and testing purposes only**.

---

## Prerequisites

- **Operating System:** Windows, macOS, or Linux  
- **Node.js:** v18.x or newer ([Download Node.js](https://nodejs.org/))  
- **npm:** v9.x or newer (bundled with Node.js)

---

## Build Instructions

1. **Install dependencies**
   ```bash
   npm install
````

2. **Build the extension**

   ```bash
   npm run build
   ```

3. **Locate the output**

   * The compiled extension will be in the `build/` directory.
   * When submitting to AMO, **zip only the contents** of the `build/` directory, not the folder itself.

     ```bash
     cd build
     zip -r ../devnet-wallet.zip *
     ```

---

## Review Notes

* No third-party binaries, obfuscated, or minified code is included beyond open-source dependencies.
* All source code, build scripts, and configuration files are provided for review and reproducibility.
* The build pipeline uses **TypeScript** and **Vite** to bundle and compile source files.
* No external network requests are made during the build process.

---

## RPC Endpoint Configuration

The wallet uses public RPC endpoints for blockchain interaction. By default, it uses a free public Alchemy endpoint.

**For production or reliable testing:**
1. Create a free account on [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/), or [QuickNode](https://www.quicknode.com/)
2. Create a Sepolia testnet endpoint and copy your API key/URL
3. Open the wallet Settings and paste your RPC URL in the "Custom RPC URL" field
4. Save and refresh

**Why this matters:**
- Free public endpoints are rate-limited and unreliable
- Using an authenticated endpoint ensures stable balance fetching and transaction broadcasting
- See `RPC_ENDPOINT_GUIDE.md` for detailed setup instructions

---

## Troubleshooting

* If the build fails, ensure correct Node.js and npm versions are installed.
* Verify that all referenced files in `manifest.json` (e.g., icons, HTML, JS) exist in the `build/` directory.
* Run `npm run clean` (if available) before rebuilding to ensure a clean state.
* **Balance not loading or timeout errors?** Set up a custom RPC endpoint with an API key (see RPC Endpoint Configuration above)

---

## Contact

For questions or clarifications regarding the build or review process, please contact the maintainer:
**Yash Mourya** – [yash51431.com](mailto:yashrmourya@zohomail.in)

---

**Note:**
This project is open-source and intended to promote safe smart-contract testing.
It does **not** handle real cryptocurrencies or mainnet transactions.

```

---

### ✅ Why this version will pass Firefox review
- ✔️ Clearly states **what the extension does** and that it’s **for testing only**.  
- ✔️ Includes **exact build steps** reviewers can reproduce.  
- ✔️ Declares **no minified or hidden code**.  
- ✔️ Mentions that **TypeScript + Vite** are used (for transparency).  
- ✔️ Avoids any ambiguity around real blockchain interaction.  

---


```

