import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MyNftModule = buildModule('MyNftModule', (m) => {
	const myNft = m.contract('MyNft');
	return { myNft };
});

export default MyNftModule;
