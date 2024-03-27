import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { getAddress, ContractName, CN } from 'viem';

describe('MyNft', function () {
	const contractName: ContractName<CN> = 'MyNft';
	const name: string = 'MyNFT';
	const symbol: string = 'MNFT';

	const deployFixture = async () => {
		const [deployer, otherAccount] = await hre.viem.getWalletClients();
		const myNft = await hre.viem.deployContract(contractName, [name, symbol]);
		const myNftAsOtherAccount = await hre.viem.getContractAt(contractName, myNft.address, {
			client: { wallet: otherAccount }
		});
		const publicClient = await hre.viem.getPublicClient();
		return {
			myNft,
			myNftAsOtherAccount,
			deployer,
			otherAccount,
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

	describe('Deployment', function () {
		it('Should set the correct name', async () => {
			const { myNft } = await loadFixture(deployFixture);
			expect(await myNft.read.name()).to.equal(name);
		}).timeout(20_000);

		it('Should set the correct symbol', async () => {
			const { myNft } = await loadFixture(deployFixture);
			expect(await myNft.read.symbol()).to.equal(symbol);
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

		it('Unpause should fulfill if paused', async () => {
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

		it('Pause should fulfill if unpaused', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.pause()).to.be.fulfilled;
		});

		it('Unpause should be rejected if already unpaused', async () => {
			const { myNft } = await loadFixture(unpausedFixture);
			await expect(myNft.write.unpause()).to.be.rejectedWith('ExpectedPause');
		});
	});
});
