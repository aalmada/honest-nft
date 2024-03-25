import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-gas-reporter';

const config: HardhatUserConfig = {
	solidity: '0.8.24',
	gasReporter: {
		currency: 'EUR'
	}
};

export default config;
