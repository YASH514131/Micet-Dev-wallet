# Contributing to TestNet Wallet

Thank you for your interest in contributing to TestNet Wallet! This guide will help you get started.

## 🎯 Project Goals

TestNet Wallet is designed to:
- Provide a safe, developer-friendly wallet for blockchain testing
- Support multiple testnet chains (EVM and Solana)
- Enforce strict mainnet blocking
- Maintain simplicity and ease of use
- Remain open source and community-driven

## 🚀 Getting Started

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/testnet-wallet.git
   cd testnet-wallet
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. Make your changes
2. Test thoroughly (see Testing section below)
3. Commit your changes:
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add support for Base Goerli testnet
fix: resolve balance display issue on Solana
docs: update API documentation with new examples
```

## 🧪 Testing

Before submitting a PR, please test:

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Can create a new wallet
- [ ] Can import existing wallet
- [ ] Network switching works
- [ ] Balance fetching works
- [ ] Faucet requests work
- [ ] Transaction signing works
- [ ] Settings are persisted correctly
- [ ] Mainnet is blocked (try to add mainnet - should fail)
- [ ] Keys are cleared on browser close (if not encrypted)

### Test on Multiple Networks

- [ ] Ethereum Sepolia
- [ ] Polygon Mumbai
- [ ] BSC Testnet
- [ ] Solana Devnet
- [ ] Local Hardhat/Anvil

### Browser Testing

Test on:
- [ ] Chrome
- [ ] Brave
- [ ] Edge (Chromium)

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing code patterns
- Add types for all parameters and return values
- Avoid `any` type when possible

### React

- Use functional components
- Use hooks (useState, useEffect, etc.)
- Keep components small and focused
- Use proper prop types

### CSS

- Use Tailwind CSS utility classes
- Follow existing design patterns
- Maintain dark theme consistency
- Keep responsive design in mind

## 📂 Project Structure

Understanding the codebase:

```
src/
├── background/          # Extension background worker
├── content/            # Content scripts
├── popup/              # React UI components
│   ├── components/     # UI components
│   ├── Popup.tsx       # Main popup component
│   └── index.tsx       # Entry point
├── utils/              # Utility modules
│   ├── evm.ts         # EVM wallet functions
│   ├── solana.ts      # Solana wallet functions
│   ├── network.ts     # Network configurations
│   ├── faucet.ts      # Faucet integrations
│   ├── crypto.ts      # Encryption utilities
│   └── storage.ts     # Storage management
└── styles/            # Global styles
```

## 🌟 Areas for Contribution

### High Priority

- [ ] Add more testnet networks (Base, Linea, zkSync, etc.)
- [ ] Improve error handling and user feedback
- [ ] Add transaction history
- [ ] Implement multi-account support
- [ ] Add automated tests

### Medium Priority

- [ ] Add custom RPC endpoint support
- [ ] Improve UI/UX
- [ ] Add token support (ERC-20, SPL)
- [ ] Better mobile/responsive design
- [ ] Add dark/light theme toggle

### Nice to Have

- [ ] Web dashboard for analytics
- [ ] Local node manager (Anvil/Hardhat)
- [ ] Address book
- [ ] Transaction templates
- [ ] Export transaction history

## 🔐 Security Considerations

When contributing, keep in mind:

1. **Never remove mainnet blocking** - This is a core security feature
2. **Validate all inputs** - Especially addresses and transaction data
3. **Handle private keys carefully** - Never log or expose them
4. **Use secure storage** - Encryption must remain strong
5. **Test thoroughly** - Security bugs can have serious consequences

### Security Review Checklist

- [ ] No mainnet chain IDs are accessible
- [ ] Private keys are not logged or exposed
- [ ] Encryption is properly implemented
- [ ] User input is validated
- [ ] No external dependencies with known vulnerabilities

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Exact steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser version, OS, extension version
6. **Screenshots**: If applicable
7. **Console Errors**: Any error messages from browser console

## 💡 Feature Requests

When suggesting features:

1. **Use Case**: Explain why this feature is needed
2. **Description**: Clear description of the feature
3. **Mockups**: If applicable, provide UI mockups
4. **Alternatives**: Any alternative solutions considered

## 📜 Code Review Process

All submissions require review. We use GitHub pull requests for this purpose.

Reviewers will check for:
- Code quality and style
- Test coverage
- Documentation
- Security implications
- Performance impact

## 🎓 Resources

### Learning

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Tools

- [Remix IDE](https://remix.ethereum.org/) - For testing smart contracts
- [Solana Playground](https://beta.solpg.io/) - For Solana development
- [Hardhat](https://hardhat.org/) - Local development environment

## 🤝 Community

- Be respectful and constructive
- Help others when you can
- Share knowledge and learnings
- Report security issues privately

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions:
1. Check the [README.md](../Readme.md)
2. Review [API.md](../API.md)
3. Look at [QUICKSTART.md](./QUICKSTART.md)
4. Open a GitHub issue

---

Thank you for contributing to TestNet Wallet! 🧩
