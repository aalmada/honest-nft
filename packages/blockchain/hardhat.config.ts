import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-gas-reporter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const { ETHERSCAN_API, COINMARKETCAP_KEY } = process.env;

const config: HardhatUserConfig = {
	solidity: '0.8.24',
	etherscan: {
		apiKey: ETHERSCAN_API
	},
	gasReporter: {
		coinmarketcap: COINMARKETCAP_KEY,
		currency: 'EUR'
	}
};

export default config;
