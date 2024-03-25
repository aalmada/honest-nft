import { formatEther } from 'viem';
import hre from 'hardhat';

// prints the balance of all accounts
async function main() {
	const clients = await hre.viem.getWalletClients();

	for (const client of clients) {
		const publicClient = await hre.viem.getPublicClient();
		const balance = await publicClient.getBalance({
			address: client.account.address
		});
		console.log(`${client.account.address} has balance ${formatEther(balance)} ETH`);
	}
}

main()
	.then(() => process.exit())
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
