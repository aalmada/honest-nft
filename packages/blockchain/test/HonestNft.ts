import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { getAddress } from 'viem';

describe('HonestNft', function () {
	const deployFixture = async () => {
		const [owner, otherAccount] = await hre.viem.getWalletClients();
		const honestNft = await hre.viem.deployContract('HonestNft', [], { from: owner.account.address });
		const publicClient = await hre.viem.getPublicClient();
		return {
			honestNft,
			owner,
			otherAccount,
			publicClient
		};
	};

	describe('Deployment', function () {
		it('Should set the right owner', async function () {
			const { honestNft, owner } = await loadFixture(deployFixture);
			expect(await honestNft.read.owner()).to.equal(getAddress(owner.account.address));
		});

		it('Should set the right name', async () => {
			const { honestNft } = await loadFixture(deployFixture);
			expect(await honestNft.read.name()).to.equal('Honest NFT');
		}).timeout(20_000);

		it('Should set the right symbol', async () => {
			const { honestNft } = await loadFixture(deployFixture);
			expect(await honestNft.read.symbol()).to.equal('HNST');
		});

		it('Should be paused', async () => {
			const { honestNft } = await loadFixture(deployFixture);
			expect(await honestNft.read.paused()).to.equal(true);
		});
	});
});
