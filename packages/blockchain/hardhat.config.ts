import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-gas-reporter';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config: HardhatUserConfig = {
	solidity: '0.8.24',
	gasReporter: {
		coinmarketcap: process.env.COINMARKETCAP_KEY,
		currency: 'EUR'
	}
};

export default config;
