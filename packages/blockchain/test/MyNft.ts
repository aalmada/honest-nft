import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { getAddress, ContractName, CN } from 'viem';

describe('MyNft', function () {
	const contractName: ContractName<CN> = 'MyNft';

	const deployFixture = async () => {
		const name: string = 'MyNFT';
		const symbol: string = 'MNFT';
		const unrevealedBaseURI: string = 'https://unrevealed.com/';
		const maxSupply: bigint = 10n;
		const [deployer, otherAccount] = await hre.viem.getWalletClients();

		const myNft = await hre.viem.deployContract(contractName, [name, symbol, unrevealedBaseURI, maxSupply]);
		const myNftAsOtherAccount = await hre.viem.getContractAt(contractName, myNft.address, {
			client: { wallet: otherAccount }
		});
		const publicClient = await hre.viem.getPublicClient();
		return {
			myNft,
			myNftAsOtherAccount,
			deployer,
			otherAccount,
			name,
			symbol,
			unrevealedBaseURI,
			maxSupply,
			publicClient
		};
	};

	const unpausedFixture = async () => {
		const { myNft, ...other } = await loadFixture(deployFixture);
		await myNft.write.unpause();
		return {
			myNft,
			...other
		};
	};

	const revealedFixture = async () => {
		const revealedBaseURI: string = 'https://revealed.com/';
		const { myNft, ...other } = await loadFixture(unpausedFixture);
		await myNft.write.reveal([revealedBaseURI]);
		return {
			myNft,
			revealedBaseURI,
			...other
		};
	};

	describe('Deployment', function () {
		it('Should set the correct name', async () => {
			const { myNft, name } = await loadFixture(deployFixture);
			expect(await myNft.read.name()).to.equal(name);
		});

		it('Should set the correct symbol', async () => {
			const { myNft, symbol } = await loadFixture(deployFixture);
			expect(await myNft.read.symbol()).to.equal(symbol);
		});

		it('Should be unrevealed', async () => {
			const { myNft } = await loadFixture(deployFixture);
			expect(await myNft.read.revealed()).to.equal(false);
		});

		it('Should set the correct unrevealed base URI', async () => {
			const { myNft, unrevealedBaseURI } = await loadFixture(deployFixture);
			expect(await myNft.read.baseURI()).to.equal(unrevealedBaseURI);
		});

		it('Should set the correct maximum supply', async () => {
			const { myNft, maxSupply } = await loadFixture(deployFixture);
			expect(await myNft.read.MAX_SUPPLY()).to.equal(maxSupply);
		});

		it('Should be paused', async () => {
			const { myNft } = await loadFixture(deployFixture);
			expect(await myNft.read.paused()).to.equal(true);
		});

		it('Deployer should have admin role', async () => {
			const { myNft, deployer } = await loadFixture(deployFixture);
			const adminRole = await myNft.read.ADMIN_ROLE();
			expect(await myNft.read.hasRole([adminRole, getAddress(deployer.account.address)])).to.equal(true);
		});

		it('Admin role should be admin of admin role', async () => {
			const { myNft } = await loadFixture(deployFixture);
			const adminRole = await myNft.read.ADMIN_ROLE();
			expect(await myNft.read.getRoleAdmin([adminRole])).to.equal(adminRole);
		});

		it('Admin role should be admin of manager role', async () => {
			const { myNft } = await loadFixture(deployFixture);
			const adminRole = await myNft.read.ADMIN_ROLE();
			const managerRole = await myNft.read.MANAGER_ROLE();
			expect(await myNft.read.getRoleAdmin([managerRole])).to.equal(adminRole);
		});
	});

	describe('Pausable', function () {
		it('Unpause should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount } = await loadFixture(deployFixture);
			await expect(myNftAsOtherAccount.write.unpause()).to.be.rejectedWith('AccessControlUnauthorizedAccount');
		});

		it('Unpause should be fulfilled if paused', async () => {
			const { myNft } = await loadFixture(deployFixture);
			await expect(myNft.write.unpause()).to.be.fulfilled;
		});

		it('Pause should be rejected if already paused', async () => {
			const { myNft } = await loadFixture(deployFixture);
			await expect(myNft.write.pause()).to.be.rejectedWith('EnforcedPause');
		});

		it('Pause should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount } = await loadFixture(unpausedFixture);
			await expect(myNftAsOtherAccount.write.pause()).to.be.rejectedWith('AccessControlUnauthorizedAccount');
		});

		it('Pause should be fulfilled if unpaused', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.pause()).to.be.fulfilled;
		});

		it('Unpause should be rejected if already unpaused', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.unpause()).to.be.rejectedWith('ExpectedPause');
		});
	});

	describe('Mint', function () {
		it('Should be rejected if paused', async () => {
			const { myNft, otherAccount } = await loadFixture(deployFixture);
			await expect(myNft.write.safeMint([getAddress(otherAccount.account.address)])).to.be.rejectedWith(
				'EnforcedPause'
			);
		});

		it('Should be fulfilled', async () => {
			const { myNft, otherAccount } = await loadFixture(unpausedFixture);
			await expect(myNft.write.safeMint([getAddress(otherAccount.account.address)])).to.be.fulfilled;
		});

		it('Should be rejected if out of stock', async () => {
			const { myNft, otherAccount } = await loadFixture(unpausedFixture);
			const maxSupply = (await myNft.read.MAX_SUPPLY()) as bigint;
			for (let i = 0; i < maxSupply; i++) {
				await myNft.write.safeMint([getAddress(otherAccount.account.address)]);
			}
			await expect(myNft.write.safeMint([getAddress(otherAccount.account.address)])).to.be.rejectedWith(
				'OutOfStock'
			);
		});
	});

	describe('Reveal', function () {
		const revealedBaseURI: string = 'https://revealed.com/';

		it('Should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount } = await loadFixture(unpausedFixture);
			await expect(myNftAsOtherAccount.write.reveal([revealedBaseURI])).to.be.rejectedWith(
				'AccessControlUnauthorizedAccount'
			);
		});

		it('Should be rejected if base URI is empty', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.reveal([''])).to.be.rejectedWith('ArgumentEmpty');
		});

		it('Should be fulfilled', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.reveal([revealedBaseURI])).to.be.fulfilled;
		});

		it('Should be rejected if already revealed', async () => {
			const { myNft } = await loadFixture(revealedFixture);
			await expect(myNft.write.reveal([revealedBaseURI])).to.be.rejectedWith('EnforcedReveal');
		});

		it('Should set the correct unrevealed base URI', async () => {
			const { myNft, revealedBaseURI } = await loadFixture(revealedFixture);
			expect(await myNft.read.baseURI()).to.equal(revealedBaseURI);
		});
	});
});
