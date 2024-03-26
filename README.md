# Honest NFT

**Honest NFT** is an Ethereum-based project that combines an **ERC721 smart contract** with a **React front end** to create a decentralized application (DApp) for minting and trading Non-Fungible Tokens (NFTs). Let's break down the components:

1. **Smart Contract**

    - The **ERC721** standard ensures that each NFT is unique and indivisible.
    - Trust is established through code, making it transparent and tamper-proof.
    - Users can mint new NFTs, and the contract enforces their authenticity.
    - Developed using:
        - [Hardhat](https://hardhat.org/)
        - [Viem](https://viem.sh/)
        - [OpenZeppelin](https://www.openzeppelin.com/contracts)

2. **Front End**
    - The front end provides a user-friendly interface for interacting with Honest NFT.
    - Key features include:
        - **Minting NFTs**: Users can create their own NFTs.
        - **Backoffice UI**: An administrative interface for managing the NFT drop.
    - Developed using:
        - [React](https://react.dev/)
        - [React Query](https://tanstack.com/query/v3/)
        - [Ant Design](https://ant.design/)
        - [ConnectKit](https://docs.family.co/connectkit)
        - [Wagmi](https://wagmi.sh/)
        - [Viem](https://viem.sh/)

## Getting Started

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/aalmada/honest-nft.git
    cd honest-nft
    ```

2. **Install Dependencies:**

    - The repository is set up as a monorepo managed using [pnpm](https://pnpm.io/), a fast, disk space efficient package manager.

    - Execute the following to install dependencies:

        ```bash
        pnpm install
        ```

3. **Deploy the Smart Contract:**

    - The smart contract development project is in folder `packages/blockchain`.

    - Add a `.env.local` file into the project folder. Copy the contents from the `.env.example` file.

    - Compile and deploy the smart contract:

        ```bash
        cd packages/blockchain
        pnpm compile
        pnpm hardhat run scripts/deploy.js --network sepolia
        ```

4. **Start the React Development Server:**

    - The frontend development project is in folder `packages/frontend`.

    - Add a `.env.local` file into the project folder. Copy the contents from the `.env.example` file.

    - Execute the following to start the React server:

        ```bash
        cd packages/frontend
        pnpm start
        ```

## Usage

-   Visit the front end in your browser (usually at `http://localhost:3000`) and connect your Ethereum wallet (e.g., MetaMask).
-   Mint new NFTs or explore the marketplace.

## Contributing

Contributions are welcome! Please create a pull request with your changes.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
