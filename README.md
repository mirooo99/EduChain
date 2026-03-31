# EduChain - Decentralized Academic Credentials

## 🎓 Overview
EduChain is a decentralized application (dApp) designed to issue and verify academic certificates for TUES Fest 2026. By using Ethereum Smart Contracts, we ensure that credentials are tamper-proof and permanently verifiable.

## 🛠 Tech Stack
- **Blockchain:** Solidity, Hardhat, Ethers.js
- **Frontend:** React.js
- **Network:** Localhost / Testnet

## 🚀 Key Features
- **Admin Issuance:** Only authorized school accounts can issue new certificates.
- **Public Verification:** Anyone can verify a certificate's authenticity by its unique hash ID.
- **Immutable Data:** Once issued, certificates cannot be altered or deleted.

## 💻 Setup
1. Clone the repository
2. Navigate to `/blockchain` and run `npm install`
3. Run local node: `npx hardhat node`
4. Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`