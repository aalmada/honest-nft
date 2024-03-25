import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { parseEther } from 'viem';

const HonestNftModule = buildModule('HonestNftModule', (m) => {
	const honestNft = m.contract('HonestNft');

	return { honestNft };
});

export default HonestNftModule;
