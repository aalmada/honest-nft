import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { getAddress, ContractName, CN, keccak256, encodePacked, Hex, zeroHash, parseEther } from 'viem';
import { MerkleTree } from 'merkletreejs';

describe('MyNft', function () {
	type MerkleLeaf = { account: Hex; id: bigint };

	const getHash = (leaf: MerkleLeaf): Hex => keccak256(encodePacked(['uint256', 'address'], [leaf.id, leaf.account]));

	const createMerkleTree = (leaves: MerkleLeaf[]): MerkleTree =>
		new MerkleTree(leaves.map(getHash), keccak256, { sort: true });

	const baseFixture = async () => {
		const contractName: ContractName<CN> = 'MyNft';
		const name: string = 'MyNFT';
		const symbol: string = 'MNFT';
		const unrevealedBaseURI: string = 'https://unrevealed.com/';
		const maxSupply: bigint = 10n;
		const [deployer, otherAccount] = await hre.viem.getWalletClients();
		const publicClient = await hre.viem.getPublicClient();
		return {
			contractName,
			name,
			symbol,
			unrevealedBaseURI,
			maxSupply,
			deployer,
			otherAccount,
			publicClient
		};
	};

	const deployedFixture = async () => {
		const { contractName, name, symbol, unrevealedBaseURI, maxSupply, otherAccount, ...other } =
			await loadFixture(baseFixture);
		const myNft = await hre.viem.deployContract(contractName, [name, symbol, unrevealedBaseURI, maxSupply]);
		const myNftAsOtherAccount = await hre.viem.getContractAt(contractName, myNft.address, {
			client: { wallet: otherAccount }
		});
		const adminRole = await myNft.read.ADMIN_ROLE();
		const managerRole = await myNft.read.MANAGER_ROLE();

		return {
			myNft,
			myNftAsOtherAccount,
			adminRole,
			managerRole,
			name,
			symbol,
			unrevealedBaseURI,
			maxSupply,
			otherAccount,
			...other
		};
	};

	const unpausedFixture = async () => {
		const { myNft, ...other } = await loadFixture(deployedFixture);
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

	const claimsHandlerFixture = async () => {
		const { myNft, deployer, otherAccount, ...other } = await loadFixture(unpausedFixture);
		const leaves: MerkleLeaf[] = [
			{
				account: getAddress(deployer.account.address),
				id: 0n
			},
			{
				account: getAddress(otherAccount.account.address),
				id: 1n
			}
		];
		const merkleTree = createMerkleTree(leaves);
		const validator = merkleTree.getHexRoot() as Hex;
		const claims = leaves.map((leaf) => ({ ...leaf, proof: merkleTree.getHexProof(getHash(leaf)) }));

		const otherLeaves: MerkleLeaf[] = [
			{
				account: getAddress(deployer.account.address),
				id: 0n
			}
		];
		const otherMerkleTree = createMerkleTree(otherLeaves);
		const otherValidator = otherMerkleTree.getHexRoot() as Hex;
		const otherClaims = leaves.map((leaf) => ({ ...leaf, proof: otherMerkleTree.getHexProof(getHash(leaf)) }));

		await myNft.write.setValidator([validator]);

		const claimCost = parseEther('0.001');
		await myNft.write.setClaimCost([claimCost]);

		return {
			myNft,
			validator,
			claims,
			claimCost,
			otherValidator,
			otherClaims,
			...other
		};
	};

	describe('Deployment', function () {
		it('Should be rejected if name is empty', async () => {
			const { contractName, symbol, unrevealedBaseURI, maxSupply } = await loadFixture(baseFixture);
			await expect(
				hre.viem.deployContract(contractName, ['', symbol, unrevealedBaseURI, maxSupply])
			).to.be.rejectedWith('ArgumentEmpty("name")');
		});

		it('Should be rejected if symbol is empty', async () => {
			const { contractName, name, unrevealedBaseURI, maxSupply } = await loadFixture(baseFixture);
			await expect(
				hre.viem.deployContract(contractName, [name, '', unrevealedBaseURI, maxSupply])
			).to.be.rejectedWith('ArgumentEmpty("symbol")');
		});

		it('Should be rejected if base URI is empty', async () => {
			const { contractName, name, symbol, maxSupply } = await loadFixture(baseFixture);
			await expect(hre.viem.deployContract(contractName, [name, symbol, '', maxSupply])).to.be.rejectedWith(
				'ArgumentEmpty("notRevealedBaseURI")'
			);
		});

		it('Should be rejected if max supply is zero', async () => {
			const { contractName, name, symbol, unrevealedBaseURI } = await loadFixture(baseFixture);
			await expect(
				hre.viem.deployContract(contractName, [name, symbol, unrevealedBaseURI, 0n])
			).to.be.rejectedWith('ArgumentOutOfRange("maxSupply", 0)');
		});

		it('Should set the correct name', async () => {
			const { myNft, name } = await loadFixture(deployedFixture);
			expect(await myNft.read.name()).to.equal(name);
		});

		it('Should set the correct symbol', async () => {
			const { myNft, symbol } = await loadFixture(deployedFixture);
			expect(await myNft.read.symbol()).to.equal(symbol);
		});

		it('Should be unrevealed', async () => {
			const { myNft } = await loadFixture(deployedFixture);
			expect(await myNft.read.revealed()).to.equal(false);
		});

		it('Should set the correct unrevealed base URI', async () => {
			const { myNft, unrevealedBaseURI } = await loadFixture(deployedFixture);
			expect(await myNft.read.baseURI()).to.equal(unrevealedBaseURI);
		});

		it('Should set the correct maximum supply', async () => {
			const { myNft, maxSupply } = await loadFixture(deployedFixture);
			expect(await myNft.read.MAX_SUPPLY()).to.equal(maxSupply);
		});

		it('Should be paused', async () => {
			const { myNft } = await loadFixture(deployedFixture);
			expect(await myNft.read.paused()).to.equal(true);
		});

		it('Deployer should have admin role', async () => {
			const { myNft, deployer, adminRole } = await loadFixture(deployedFixture);
			expect(await myNft.read.hasRole([adminRole, getAddress(deployer.account.address)])).to.equal(true);
		});

		it('Claims handler should be disabled', async () => {
			const { myNft } = await loadFixture(deployedFixture);
			expect(await myNft.read.claimingEnabled()).to.be.equal(false);
		});
	});

	describe('Access Control', function () {
		it('Admin role should be admin of admin role', async () => {
			const { myNft, adminRole } = await loadFixture(deployedFixture);
			expect(await myNft.read.getRoleAdmin([adminRole])).to.equal(adminRole);
		});

		it('Admin role should be admin of manager role', async () => {
			const { myNft, adminRole, managerRole } = await loadFixture(deployedFixture);
			expect(await myNft.read.getRoleAdmin([managerRole])).to.equal(adminRole);
		});

		it('Revoke should be rejected if revoking sender', async () => {
			const { myNft, deployer, adminRole } = await loadFixture(deployedFixture);
			await expect(myNft.write.revokeRole([adminRole, getAddress(deployer.account.address)])).to.rejectedWith(
				'NotSupported'
			);
		});

		it('Renounce should be always rejected', async () => {
			const { myNft, deployer, adminRole } = await loadFixture(deployedFixture);
			await expect(myNft.write.revokeRole([adminRole, getAddress(deployer.account.address)])).to.rejectedWith(
				'NotSupported'
			);
		});
	});

	describe('Pausable', function () {
		it('Unpause should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount } = await loadFixture(deployedFixture);
			await expect(myNftAsOtherAccount.write.unpause()).to.be.rejectedWith('AccessControlUnauthorizedAccount');
		});

		it('Unpause should be fulfilled if paused', async () => {
			const { myNft } = await loadFixture(deployedFixture);
			await expect(myNft.write.unpause()).to.be.fulfilled;
		});

		it('Pause should be rejected if already paused', async () => {
			const { myNft } = await loadFixture(deployedFixture);
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
			const { myNft, otherAccount } = await loadFixture(deployedFixture);
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

	describe('Claims Handler', function () {
		it('Should set the correct validator', async () => {
			const { myNft, validator } = await loadFixture(claimsHandlerFixture);
			expect(await myNft.read.validator()).to.equal(validator);
		});

		it('Set validator should be rejected if already set', async () => {
			const { myNft, otherValidator } = await loadFixture(claimsHandlerFixture);
			await expect(myNft.write.setValidator([otherValidator])).to.be.rejectedWith('EnforceValidator');
		});

		it('Set validator should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount, otherValidator } = await loadFixture(claimsHandlerFixture);
			await expect(myNftAsOtherAccount.write.setValidator([otherValidator])).to.be.rejectedWith(
				'AccessControlUnauthorizedAccount'
			);
		});

		it('Set claim cost should be rejected if not administrator', async () => {
			const { myNftAsOtherAccount } = await loadFixture(claimsHandlerFixture);
			const cost = parseEther('0.1');
			await expect(myNftAsOtherAccount.write.setClaimCost([cost])).to.be.rejectedWith(
				'AccessControlUnauthorizedAccount'
			);
		});

		it('Claim should be fullfiled', async () => {
			const { myNft, claims, claimCost } = await loadFixture(claimsHandlerFixture);
			const { id, proof } = claims[0];
			await expect(myNft.write.claim([id, proof], { value: claimCost })).to.be.fulfilled;
		});

		it('Claim should be rejected if wrong pair of id and proof', async () => {
			const { myNft, otherClaims, claimCost } = await loadFixture(claimsHandlerFixture);
			const { id, proof } = otherClaims[0];
			await expect(myNft.write.claim([id, proof], { value: claimCost })).to.be.rejectedWith('InvalidProof');
		});

		it('Claim should be rejected if validator not set', async () => {
			const { myNft, claims, claimCost } = await loadFixture(claimsHandlerFixture);
			const { id, proof } = claims[0];
			await myNft.write.setValidator([zeroHash]);
			await expect(myNft.write.claim([id, proof], { value: claimCost })).to.be.rejectedWith('ExpectedValidator');
		});
	});
});
