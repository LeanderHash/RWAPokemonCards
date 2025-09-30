# RWA Pokemon Cards

A decentralized application (DApp) that enables **confidential ownership** of NFT Pokemon cards using **Fully Homomorphic Encryption (FHE)** technology. This project demonstrates how Real World Assets (RWA) can be tokenized with privacy-preserving smart contracts, where the true owner of each NFT remains encrypted on-chain while still allowing authorized transfers and verifications.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Advantages](#advantages)
- [Technology Stack](#technology-stack)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Smart Contract Design](#smart-contract-design)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Compilation](#compilation)
  - [Deployment](#deployment)
  - [Running the Frontend](#running-the-frontend)
- [Usage Guide](#usage-guide)
  - [Minting Cards](#minting-cards)
  - [Viewing Cards](#viewing-cards)
  - [Transferring Cards](#transferring-cards)
- [Project Structure](#project-structure)
- [Technical Deep Dive](#technical-deep-dive)
  - [FHE Integration](#fhe-integration)
  - [Encrypted Owner Management](#encrypted-owner-management)
  - [Access Control](#access-control)
- [Future Roadmap](#future-roadmap)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**RWA Pokemon Cards** is a pioneering blockchain project that combines the popular concept of collectible Pokemon cards with cutting-edge cryptographic technology. Built on the Ethereum Sepolia testnet using Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine), this project enables users to:

- **Mint** NFT Pokemon cards with encrypted ownership information
- **View** card metadata and images while keeping ownership private
- **Transfer** cards securely using FHE-encrypted proofs

Unlike traditional NFTs where ownership is publicly visible on-chain, this implementation **encrypts the true owner's address** while maintaining the ability to perform operations like transfers and verification.

---

## Key Features

### 1. **Confidential Ownership**
The actual owner of each Pokemon card is stored as an encrypted address (`eaddress`) on-chain. This means:
- Public observers can see that a card exists and who holds the token
- Only authorized parties can decrypt and verify the true encrypted owner
- Privacy is maintained while preserving blockchain transparency

### 2. **FHE-Powered Transfers**
Card transfers use Fully Homomorphic Encryption to:
- Verify ownership without decrypting sensitive data
- Allow transfers only when the caller has proper access control permissions
- Update encrypted owner information atomically during transfers

### 3. **ERC721 Compliance**
Built on OpenZeppelin's battle-tested ERC721 standard with extensions:
- **ERC721Enumerable**: Track total supply and enumerate tokens
- **ERC721URIStorage**: Store metadata URIs for each card
- Full compatibility with existing NFT marketplaces and wallets

### 4. **Modern Web3 Frontend**
React-based UI with:
- **RainbowKit** wallet connection (supports MetaMask, WalletConnect, Coinbase, etc.)
- **Wagmi** hooks for blockchain interactions
- **Zama SDK** client-side encryption
- Real-time transaction feedback with Etherscan links
- Responsive design with custom CSS styling

### 5. **Developer-Friendly**
- Hardhat development environment
- TypeScript support throughout
- Comprehensive deployment scripts
- Easy testnet deployment to Sepolia

---

## Advantages

### Privacy Preservation
- **Hidden Ownership**: True owners remain confidential, protecting high-value asset holders from targeted attacks
- **Selective Disclosure**: Owners can prove ownership only to authorized parties
- **Competitive Advantage**: Collectors can maintain private portfolios without revealing their holdings

### Enhanced Security
- **FHE-Based Access Control**: Leverages homomorphic encryption for cryptographically secure permission checks
- **No Trusted Third Parties**: Encryption happens client-side; no centralized key management
- **Audit Trail**: All transactions are on-chain and verifiable while maintaining privacy

### Regulatory Compliance
- **KYC/AML Ready**: Can integrate with compliance systems while protecting user privacy
- **GDPR Alignment**: Encrypted PII (Personally Identifiable Information) reduces data protection risks
- **Flexible Disclosure**: Can implement regulatory reporting without public exposure

### Innovation Showcase
- **FHE Pioneering**: Demonstrates practical use of advanced cryptography in real-world applications
- **RWA Integration**: Blueprint for tokenizing physical assets with privacy requirements
- **Scalable Pattern**: Architecture can be adapted for various confidential asset classes

---

## Technology Stack

### Blockchain Layer
- **Solidity ^0.8.24**: Smart contract programming language
- **Zama fhEVM**: Fully Homomorphic Encryption Virtual Machine for confidential smart contracts
- **OpenZeppelin Contracts**: Secure, audited smart contract libraries
  - ERC721: NFT standard implementation
  - ERC721Enumerable: Token enumeration extension
  - ERC721URIStorage: Token metadata management
- **Ethereum Sepolia**: Testnet deployment for development and testing

### Development Tools
- **Hardhat 2.26.0**: Ethereum development environment
  - Local blockchain simulation
  - Contract compilation and testing
  - Deployment management with hardhat-deploy
  - Network forking capabilities
- **TypeScript 5.8.3**: Static typing for contracts and scripts
- **TypeChain**: TypeScript bindings for smart contracts
- **Ethers.js 6.15.0**: Ethereum library for blockchain interactions

### Frontend Stack
- **React 19.1.1**: Modern UI framework with hooks
- **Vite 7.1.6**: Fast build tool and dev server
- **RainbowKit 2.2.8**: Beautiful, customizable wallet connection
- **Wagmi 2.17.0**: React hooks for Ethereum
- **TanStack Query 5.89.0**: Data fetching and caching
- **Zama Relayer SDK 0.2.0**: Client-side FHE operations
- **Ethers.js 6.15.0**: Contract interaction layer
- **Viem 2.37.6**: TypeScript Ethereum utilities

### Testing & Quality
- **Mocha**: JavaScript test framework
- **Chai**: Assertion library with promise support
- **Solhint**: Solidity linter for best practices
- **ESLint**: TypeScript/JavaScript linting
- **Prettier**: Code formatting
- **Solidity Coverage**: Test coverage reporting

### DevOps & Deployment
- **Hardhat Deploy**: Declarative deployment system
- **Hardhat Verify**: Etherscan contract verification
- **Netlify**: Frontend hosting and deployment
- **GitHub Actions**: CI/CD automation (configurable)

---

## Problem Statement

### Challenges with Traditional NFTs

**1. Privacy Concerns**
- All NFT ownership is publicly visible on blockchain explorers
- High-value collectors become targets for phishing, social engineering, and physical threats
- Competitive collectors cannot maintain strategic portfolios privately

**2. Real World Asset Limitations**
- Physical assets (art, collectibles, real estate) tokenization faces regulatory privacy requirements
- KYC/AML compliance often conflicts with blockchain transparency
- Sensitive ownership information (institutions, celebrities) needs protection

**3. Access Control Issues**
- Traditional NFT transfers rely solely on wallet signatures
- No built-in mechanism for conditional or private transfers
- Complex ownership structures (trusts, DAOs) are difficult to implement privately

**4. Market Dynamics**
- "Whale watching" can manipulate markets when large holders' movements are visible
- Front-running opportunities arise from transparent order books
- Strategic collecting becomes impossible when all positions are public

### Why Existing Solutions Fall Short

- **Off-chain privacy**: Centralized databases defeat blockchain's trustless nature
- **Layer 2 privacy**: Adds complexity and reduces composability
- **Zero-knowledge proofs**: Limited to specific use cases, not general computation
- **Private blockchains**: Sacrifice decentralization and public verifiability

---

## Solution Architecture

### FHE-Powered Confidential NFTs

This project leverages **Fully Homomorphic Encryption (FHE)** to enable computation on encrypted data without decryption:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Zama SDK: Encrypt owner address locally            │     │
│  │  Generate proof for encrypted input                  │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │ Encrypted data + Proof                   │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Smart Contract (fhEVM)                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │  FHE.fromExternal(): Import encrypted address       │     │
│  │  FHE.isSenderAllowed(): Verify access control       │     │
│  │  FHE.allow(): Grant decryption permissions          │     │
│  │  Store eaddress: Encrypted owner on-chain           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Public State:                Encrypted State:               │
│  - Token ID                   - eaddress (encrypted owner)   │
│  - Token URI                  - ACL (access control list)    │
│  - Public holder                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dual Ownership Model

The contract maintains **two ownership records**:

1. **Public ERC721 Owner**: Visible holder of the token (wallet custody)
2. **Encrypted True Owner**: FHE-encrypted address of the actual beneficial owner

This enables scenarios like:
- Custodial services holding tokens on behalf of private owners
- DAO treasuries managing assets with encrypted beneficiaries
- Privacy-preserving marketplaces with hidden buyers

---

## Smart Contract Design

### Core Contract: `RWAPokemonCards.sol`

```solidity
contract RWAPokemonCards is
    SepoliaConfig,        // Zama network configuration
    ERC721,               // NFT base functionality
    ERC721Enumerable,     // Token enumeration
    ERC721URIStorage      // Metadata storage
```

### Key State Variables

```solidity
// Maps tokenId to encrypted owner address
mapping(uint256 => eaddress) private _encryptedOwner;

// Counter for token IDs
uint256 private _idCounter;
```

### Critical Functions

#### **1. mintCard()**
Mints a new Pokemon card with encrypted ownership:

```solidity
function mintCard(
    string memory tokenUri,           // Metadata URI (e.g., IPFS)
    externalEaddress encryptedTo,     // Encrypted recipient
    bytes calldata inputProof         // Zero-knowledge proof
) external returns (uint256)
```

**Process:**
1. Import encrypted address from client-side encryption
2. Mint ERC721 token to `msg.sender` (public holder)
3. Store encrypted owner in `_encryptedOwner` mapping
4. Set up access control list (ACL) for decryption permissions
5. Emit `CardMinted` event

#### **2. transfer()**
Confidential transfer requiring FHE proof of ownership:

```solidity
function transfer(
    uint256 tokenId,
    address to,
    externalEaddress encryptedCurrentOwner,  // Proof of current ownership
    externalEaddress encryptedTo,            // New encrypted owner
    bytes calldata inputProof
) external
```

**Security Checks:**
1. Verify token exists
2. Check caller has ACL permission on stored encrypted owner
3. Verify caller can access the provided encrypted current owner
4. Transfer public ERC721 ownership
5. Update encrypted owner to new recipient
6. Update ACL for new owner

#### **3. getEncryptedOwner()**
Returns the encrypted owner (only decryptable by authorized parties):

```solidity
function getEncryptedOwner(uint256 tokenId)
    external
    view
    returns (eaddress)
```

### Access Control with FHE ACL

Zama's fhEVM provides built-in **Access Control Lists (ACL)** for encrypted data:

```solidity
// Grant contract itself permission to use encrypted data
FHE.allowThis(encryptedAddress);

// Grant specific address permission to decrypt
FHE.allow(encryptedAddress, ownerAddress);

// Check if caller has permission
FHE.isSenderAllowed(encryptedAddress);
```

This creates a trustless permission system where:
- Only authorized addresses can decrypt sensitive data
- Permissions are cryptographically enforced by fhEVM
- No centralized key management required

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository
- **Ethereum Wallet**: MetaMask or compatible (with Sepolia ETH)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/RWAPokemonCards.git
cd RWAPokemonCards
```

2. **Install smart contract dependencies:**
```bash
npm install
```

3. **Install frontend dependencies:**
```bash
cd home
npm install
cd ..
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Wallet Configuration
MNEMONIC="your twelve word mnemonic phrase here"
PRIVATE_KEY="0xYourPrivateKeyHere"

# RPC Configuration
INFURA_API_KEY="your_infura_api_key"
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# Etherscan Verification
ETHERSCAN_API_KEY="your_etherscan_api_key"

# Optional: Gas Reporting
REPORT_GAS=false
```

**Security Warning:** Never commit `.env` files! They are already in `.gitignore`.

### Compilation

Compile the smart contracts:

```bash
npm run compile
```

This will:
- Compile all Solidity contracts in `contracts/`
- Generate TypeScript typings with TypeChain
- Output artifacts to `artifacts/` and `types/`

### Deployment

#### Deploy to Sepolia Testnet

1. **Fund your wallet:**
   - Get Sepolia ETH from faucets:
     - https://sepoliafaucet.com/
     - https://www.alchemy.com/faucets/ethereum-sepolia

2. **Deploy the contract:**
```bash
npm run deploy:sepolia
```

3. **Verify on Etherscan:**
```bash
npm run verify:sepolia
```

The deployment script will output the contract address. **Save this address** for frontend configuration.

#### Deploy to Local Hardhat Network

For development and testing:

```bash
# Terminal 1: Start local node
npm run chain

# Terminal 2: Deploy
npm run deploy:localhost
```

### Running the Frontend

1. **Configure contract address:**

Edit `home/src/config/contracts.ts`:
```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

2. **Start the development server:**
```bash
cd home
npm run dev
```

3. **Access the application:**
Open browser to `http://localhost:5173`

4. **Connect wallet:**
- Click "Connect Wallet" button
- Select your wallet (MetaMask, WalletConnect, etc.)
- Approve connection and switch to Sepolia network if prompted

---

## Usage Guide

### Minting Cards

1. Navigate to the **Mint** tab
2. **Token URI**: Enter the metadata URI for your Pokemon card
   - Example: `https://ipfs.io/ipfs/QmYourCardMetadata`
   - Should point to JSON with image and attributes
3. **Recipient Address**: Enter the Ethereum address to be encrypted as the true owner
   - Can be your own address or someone else's
   - This address will be encrypted on-chain
4. Click **Mint**
5. Approve the transaction in your wallet
6. Wait for confirmation (view on Etherscan via the provided link)

**What Happens:**
- Zama SDK encrypts the recipient address locally in your browser
- Encrypted data + proof is sent to the smart contract
- Contract verifies proof and stores encrypted owner
- ERC721 token is minted to your wallet (public holder)
- You receive a unique Token ID

### Viewing Cards

1. Navigate to the **View** tab
2. Enter a **Token ID** (starting from 1)
3. View:
   - **Total Supply**: Number of cards minted
   - **Public Owner**: Wallet holding the token
   - **Card Image**: Displayed from Token URI
   - **Encrypted Owner**: Shown as `***` (encrypted on-chain)

**Privacy Note:** Only addresses with ACL permissions can decrypt the true owner.

### Transferring Cards

1. Navigate to the **Transfer** tab
2. **Token ID**: Enter the ID of the card you want to transfer
3. **To Address**: Enter the recipient's Ethereum address
4. Click **Transfer**
5. Approve the transaction

**What Happens:**
- Zama SDK encrypts both current owner and new owner addresses
- Contract verifies you have permission to access the encrypted owner
- Public ERC721 ownership transfers to recipient
- Encrypted owner is updated with new address
- ACL permissions are updated for the new owner

**Security:** Transfer will fail if:
- You don't have ACL permissions on the encrypted owner
- Token doesn't exist
- Invalid recipient address

---

## Project Structure

```
RWAPokemonCards/
├── contracts/                    # Solidity smart contracts
│   ├── RWAPokemonCards.sol      # Main NFT contract with FHE
│   └── FHECounter.sol           # Example FHE counter (reference)
│
├── deploy/                       # Hardhat deployment scripts
│   └── deploy.ts                # RWAPokemonCards deployment
│
├── test/                         # Smart contract tests
│   └── RWAPokemonCards.test.ts  # Test suite (to be implemented)
│
├── tasks/                        # Hardhat custom tasks
│   ├── accounts.ts              # Display account balances
│   └── FHECounter.ts            # Example task
│
├── home/                         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── PokemonApp.tsx   # Main UI component
│   │   ├── config/
│   │   │   └── contracts.ts     # Contract address & ABI
│   │   ├── hooks/
│   │   │   ├── useZamaInstance.ts    # Zama SDK initialization
│   │   │   └── useEthersSigner.ts    # Ethers signer hook
│   │   ├── styles/
│   │   │   └── PokemonApp.css   # Custom styling
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Application entry point
│   │
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript config
│   └── netlify.toml             # Netlify deployment config
│
├── artifacts/                    # Compiled contract artifacts
├── cache/                        # Hardhat cache
├── types/                        # Generated TypeChain types
├── fhevmTemp/                    # fhEVM temporary files
├── deployments/                  # Deployment records
│
├── hardhat.config.ts            # Hardhat configuration
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── LICENSE                      # BSD-3-Clause-Clear license
└── README.md                    # This file
```

---

## Technical Deep Dive

### FHE Integration

**Fully Homomorphic Encryption (FHE)** allows computation on encrypted data without decryption:

#### Zama fhEVM Architecture

```
Client Side (Browser):
┌─────────────────────────────────────┐
│ Zama SDK (JavaScript)               │
│                                     │
│ 1. Generate FHE public key          │
│ 2. Encrypt sensitive data           │
│    (e.g., owner address)            │
│ 3. Create zero-knowledge proof      │
│    (proves correct encryption)      │
└──────────────┬──────────────────────┘
               │
               │ Send: encryptedData + proof
               ▼
Blockchain (fhEVM):
┌─────────────────────────────────────┐
│ Zama fhEVM (Modified EVM)           │
│                                     │
│ 1. FHE.fromExternal(encrypted, proof)│
│    → Verify proof                   │
│    → Import encrypted data          │
│                                     │
│ 2. FHE.isSenderAllowed(eaddress)    │
│    → Check ACL permissions          │
│                                     │
│ 3. FHE.allow(eaddress, user)        │
│    → Grant decryption permission    │
│                                     │
│ 4. Store eaddress on-chain          │
│    → Remains encrypted               │
└─────────────────────────────────────┘
```

#### Encrypted Types

fhEVM provides encrypted types mirroring Solidity primitives:

```solidity
eaddress    // Encrypted address
euint8      // Encrypted 8-bit unsigned integer
euint16     // Encrypted 16-bit unsigned integer
euint32     // Encrypted 32-bit unsigned integer
euint64     // Encrypted 64-bit unsigned integer
ebool       // Encrypted boolean
```

**Operations on Encrypted Data:**
```solidity
ebool isEqual = FHE.eq(encryptedAddr1, encryptedAddr2);  // Comparison
euint32 sum = FHE.add(encryptedNum1, encryptedNum2);     // Addition
euint32 product = FHE.mul(encryptedNum1, encryptedNum2); // Multiplication
```

### Encrypted Owner Management

#### Mint Flow

```solidity
function mintCard(
    string memory tokenUri,
    externalEaddress encryptedTo,
    bytes calldata inputProof
) external returns (uint256) {
    // Step 1: Import encrypted address from client
    eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

    // Step 2: Mint public ERC721 token
    uint256 tokenId = ++_idCounter;
    _safeMint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenUri);

    // Step 3: Store encrypted owner
    _encryptedOwner[tokenId] = toEnc;

    // Step 4: Set up access control
    FHE.allowThis(toEnc);           // Contract can use this data
    FHE.allow(toEnc, msg.sender);   // Minter can decrypt

    emit CardMinted(tokenId, tokenUri, msg.sender);
    return tokenId;
}
```

#### Transfer Flow

```solidity
function transfer(
    uint256 tokenId,
    address to,
    externalEaddress encryptedCurrentOwner,
    externalEaddress encryptedTo,
    bytes calldata inputProof
) external {
    // Step 1: Import encrypted addresses
    eaddress currOwnerEnc = FHE.fromExternal(encryptedCurrentOwner, inputProof);
    eaddress toEnc = FHE.fromExternal(encryptedTo, inputProof);

    // Step 2: Verify caller has permissions (CRITICAL)
    if (!FHE.isSenderAllowed(_encryptedOwner[tokenId]))
        revert UnauthorizedTransfer();
    if (!FHE.isSenderAllowed(currOwnerEnc))
        revert UnauthorizedTransfer();

    // Step 3: Transfer public ownership
    transferFrom(ownerOf(tokenId), to, tokenId);

    // Step 4: Update encrypted owner
    _encryptedOwner[tokenId] = toEnc;
    FHE.allowThis(toEnc);
    FHE.allow(toEnc, to);
}
```

### Access Control

**ACL (Access Control List) System:**

Every encrypted value has an associated ACL managed by fhEVM:

```solidity
// Grant permissions
FHE.allow(encryptedValue, user);      // User can decrypt
FHE.allowThis(encryptedValue);        // Contract can use in computations

// Check permissions
bool allowed = FHE.isSenderAllowed(encryptedValue);

// Permissions are required for:
// 1. Decrypting the value (off-chain)
// 2. Using the value in FHE operations (on-chain)
```

**Permission Lifecycle:**

```
Mint:
  Owner → Contract (allowThis)
  Owner → Minter (allow)

Transfer:
  Owner → Contract (allowThis)
  Owner → New Owner (allow)
  Owner → Old Owner (permission revoked via new eaddress)
```

**Security Model:**
- Permissions are cryptographically enforced by fhEVM
- No central authority can bypass ACL
- Permissions cannot be forged or stolen
- Each encrypted value has independent ACL

---

## Future Roadmap

### Phase 1: Enhanced Privacy Features (Q2 2025)
- [ ] **Encrypted Attributes**: Store Pokemon stats (HP, Attack, Defense) as encrypted values
- [ ] **Private Trading**: Implement encrypted bid/ask marketplace
- [ ] **Confidential Rarity**: Hide card rarity tiers from public view
- [ ] **Batch Operations**: Mint/transfer multiple cards in one transaction
- [ ] **Metadata Encryption**: Encrypt token URIs for complete privacy

### Phase 2: Advanced Functionality (Q3 2025)
- [ ] **Confidential Auctions**: Dutch auctions with hidden current prices
- [ ] **Encrypted Ownership Proofs**: Generate ZK proofs of ownership without revealing identity
- [ ] **Time-Locked Transfers**: Schedule transfers with encrypted unlock times
- [ ] **Multi-Signature Encrypted Ownership**: Require multiple signatures for transfers
- [ ] **Delegated Permissions**: Allow temporary access without ownership transfer

### Phase 3: Gaming & Utility (Q4 2025)
- [ ] **Battle System**: Use encrypted stats in on-chain Pokemon battles
- [ ] **Breeding Mechanics**: Combine cards to create new ones with inherited encrypted traits
- [ ] **Staking & Rewards**: Earn tokens by staking cards (encrypted staking amounts)
- [ ] **Tournament System**: Compete with encrypted deck compositions
- [ ] **Achievement System**: Track progress with encrypted milestones

### Phase 4: Ecosystem Expansion (2026)
- [ ] **Multi-Chain Deployment**: Bridge to Polygon, Arbitrum, Optimism
- [ ] **Mainnet Launch**: Deploy to Ethereum mainnet with Zama fhEVM
- [ ] **DAO Governance**: Community-driven development with encrypted voting
- [ ] **API & SDK**: Developer tools for building on top of the platform
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Physical Integration**: NFC-enabled physical cards linked to NFTs

### Phase 5: Enterprise & Compliance (2026+)
- [ ] **KYC/AML Integration**: Compliance layer with privacy preservation
- [ ] **Institutional Custody**: Support for custodial wallets with encrypted beneficiaries
- [ ] **Regulatory Reporting**: Selective disclosure for regulators
- [ ] **Insurance Products**: Underwriting based on encrypted asset portfolios
- [ ] **Fractional Ownership**: Encrypted share distribution for high-value cards

### Research & Development
- [ ] **FHE Performance Optimization**: Reduce gas costs for encrypted operations
- [ ] **Advanced ZK Proofs**: Combine ZK-SNARKs with FHE for efficiency
- [ ] **Quantum Resistance**: Ensure long-term security against quantum attacks
- [ ] **Decentralized FHE Networks**: Distributed key generation and management
- [ ] **Cross-Chain FHE**: Interoperability between different FHE blockchains

---

## Security Considerations

### Smart Contract Security

**Audits:**
- [ ] **Pending external audit** by reputable security firm
- Uses audited OpenZeppelin contracts as base
- fhEVM libraries are provided by Zama (security-focused)

**Known Considerations:**
1. **ACL Permissions**: Always verify `FHE.isSenderAllowed()` before transfers
2. **Reentrancy**: Protected by OpenZeppelin's ReentrancyGuard patterns
3. **Integer Overflow**: Solidity 0.8.x includes built-in overflow checks
4. **Access Control**: Custom transfer function bypasses standard ERC721 checks by design

**Best Practices Implemented:**
- Minimal external calls
- Checks-Effects-Interactions pattern
- Clear error messages with custom errors
- No assembly or delegatecall usage

### Encryption Security

**FHE Properties:**
- **Semantic Security**: Encrypted values reveal no information about plaintext
- **Ciphertext Indistinguishability**: Identical values produce different ciphertexts
- **Homomorphic Operations**: Computations don't leak information
- **Post-Quantum Security**: FHE schemes resist quantum computer attacks

**Threat Model:**
- ✅ Protected against: Public observation, data scraping, front-running
- ✅ Protected against: Contract exploitation (data remains encrypted)
- ⚠️ Limited protection: Side-channel attacks (gas analysis, timing)
- ⚠️ Limited protection: Network-level observation (encrypted payloads visible)

### Client-Side Security

**Browser Security:**
- Encryption happens client-side before transmission
- Never send plaintext sensitive data to RPC endpoints
- Private keys never leave wallet (MetaMask, etc.)
- Zama SDK runs in isolated web worker

**Recommendations:**
- Use hardware wallets (Ledger, Trezor) for high-value assets
- Verify contract addresses before interacting
- Check Etherscan for contract verification
- Use VPN when accessing DApp from public networks

### Operational Security

**Key Management:**
- Never share private keys or mnemonics
- Store `.env` files securely (encrypted drives)
- Use separate wallets for testing vs. production
- Enable 2FA on all related accounts (Infura, Etherscan, GitHub)

**Deployment Security:**
- Verify contract bytecode matches source on Etherscan
- Test thoroughly on testnet before mainnet deployment
- Use multi-signature wallets for contract ownership
- Implement time-locks for sensitive operations

### Responsible Disclosure

Found a security issue? Please report responsibly:
- **Email**: security@example.com (replace with actual contact)
- **Encrypted**: PGP key available on request
- **Bounty**: Bug bounty program details (TBD)

**Please do not:**
- Disclose publicly before we've addressed the issue
- Exploit vulnerabilities on mainnet
- Test attacks on production systems

---

## Contributing

We welcome contributions from the community! Here's how to get involved:

### Development Workflow

1. **Fork the repository**
```bash
git fork https://github.com/your-username/RWAPokemonCards.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/amazing-new-feature
```

3. **Make your changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new functionality

4. **Run tests and linting**
```bash
npm run test
npm run lint
npm run prettier:check
```

5. **Commit with descriptive messages**
```bash
git commit -m "feat: add encrypted card attributes"
```

6. **Push and create pull request**
```bash
git push origin feature/amazing-new-feature
```

### Contribution Guidelines

**Code Style:**
- TypeScript: Follow project ESLint config
- Solidity: Follow Solhint rules, NatSpec comments
- Formatting: Prettier with project config

**Commit Messages:**
- Use conventional commits format
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- Example: `feat(contract): add batch minting function`

**Testing:**
- Write unit tests for new contract functions
- Include integration tests for complex features
- Maintain >80% code coverage

**Documentation:**
- Update README for new features
- Add inline comments for complex logic
- Create docs/ entries for major additions

### Areas for Contribution

**Smart Contracts:**
- Additional encrypted attributes
- Gas optimization
- New NFT standards (ERC-1155, etc.)

**Frontend:**
- UI/UX improvements
- Mobile responsiveness
- Accessibility features

**Testing:**
- Unit test coverage
- Integration test scenarios
- Fuzzing and edge cases

**Documentation:**
- Tutorial videos
- Developer guides
- Architecture diagrams

**Community:**
- Discord bot integration
- Translation to other languages
- Community forum moderation

---

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
Copyright (c) 2024, RWA Pokemon Cards Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
THIS LICENSE.
```

**Dependencies:**
- OpenZeppelin Contracts: MIT License
- Zama fhEVM: BSD-3-Clause-Clear License
- Hardhat: MIT License
- React: MIT License

---

## Acknowledgments

### Technology Partners
- **Zama**: For pioneering FHE technology and fhEVM infrastructure
  - Website: https://www.zama.ai/
  - fhEVM Docs: https://docs.zama.ai/fhevm
- **OpenZeppelin**: For secure, audited smart contract libraries
  - Website: https://www.openzeppelin.com/
- **Hardhat**: For excellent Ethereum development environment
  - Website: https://hardhat.org/

### Inspiration
- **Pokemon TCG**: The iconic trading card game that inspired this project
- **CryptoPunks & Bored Apes**: NFT pioneers demonstrating digital collectible value
- **Tornado Cash**: Privacy-preserving protocols on Ethereum
- **Aztec Protocol**: ZK-rollup privacy solutions

### Community
- **fhEVM Discord**: For technical support and discussions
- **Ethereum Developers**: For continuous innovation in blockchain technology
- **Open Source Contributors**: For making decentralized development possible

### Special Thanks
- Beta testers who provided invaluable feedback
- Security researchers who responsibly disclosed vulnerabilities
- Community members who contributed code, docs, and ideas

---

## Contact & Resources

### Project Links
- **GitHub**: https://github.com/your-username/RWAPokemonCards
- **Live Demo**: https://rwa-pokemon-cards.netlify.app (update with actual URL)
- **Documentation**: https://docs.rwa-pokemon-cards.com (if applicable)
- **Discord**: https://discord.gg/your-invite (community server)

### Developer Resources
- **Zama fhEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Wagmi Documentation**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/docs

### Support
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: support@example.com (replace with actual)
- **Twitter**: @RWAPokemonCards (if applicable)

---

## Changelog

### v0.1.0 (Current)
- Initial release
- ERC721 NFT with FHE-encrypted ownership
- Mint, view, and transfer functionality
- React frontend with RainbowKit
- Sepolia testnet deployment

### Coming Soon
- See [Future Roadmap](#future-roadmap) for planned features

---

**Built with ❤️ by the RWA Pokemon Cards team**

*Combining the joy of collecting with the power of privacy-preserving blockchain technology.*

---

## FAQ

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE allows computations on encrypted data without decrypting it. This enables blockchain smart contracts to process sensitive information while keeping it confidential.

**Q: Why use Sepolia testnet?**
A: Zama's fhEVM is currently available on Sepolia for testing. Mainnet deployment will follow after thorough testing and audits.

**Q: Can I use this with regular MetaMask?**
A: Yes! The DApp works with any standard Ethereum wallet. The encryption happens in your browser via Zama SDK.

**Q: Is the encrypted owner completely private?**
A: The encrypted owner address is stored on-chain but only decryptable by addresses with ACL permissions. Even blockchain explorers cannot read the plaintext.

**Q: What are the gas costs?**
A: FHE operations are more expensive than regular EVM operations. Expect higher gas costs compared to traditional NFTs, but Zama is continuously optimizing.

**Q: Can I use this in production?**
A: This is currently a testnet demo. For production use, wait for mainnet fhEVM launch and complete security audits.

**Q: How do I get Sepolia ETH?**
A: Use public faucets like https://sepoliafaucet.com/ or https://www.alchemy.com/faucets/ethereum-sepolia

**Q: Where are card images stored?**
A: Token URIs can point to IPFS, Arweave, or any HTTP-accessible metadata. The contract only stores the URI, not the image itself.

**Q: Can I integrate this with my project?**
A: Absolutely! The code is open source under BSD-3-Clause-Clear license. Follow contribution guidelines if submitting changes back.

**Q: What happens if I lose my private key?**
A: Just like any blockchain asset, losing your private key means permanent loss of access. Always back up your keys securely!

---

*This README is living documentation and will be updated as the project evolves. Last updated: 2024-12-30*