import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-gas-reporter';

const config: HardhatUserConfig = {
	solidity: '0.8.24',
	etherscan: {
		apiKey: vars.get('ETHERSCAN_API')
	},
	gasReporter: {
		coinmarketcap: vars.get('COINMARKETCAP_KEY'),
		currency: 'EUR'
	}
};

export default config;
