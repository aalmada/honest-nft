import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const HonestNftModule = buildModule('HonestNftModule', (m) => {
	const honestNft = m.contract('HonestNft');
	return { honestNft };
});

export default HonestNftModule;
