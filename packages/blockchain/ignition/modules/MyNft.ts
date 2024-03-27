import { buildModule, ModuleBuilder } from '@nomicfoundation/hardhat-ignition/modules';

const MyNftModule = buildModule('MyNftModule', (m: ModuleBuilder) => {
	const name = m.getParameter('name', 'My Token');
	const symbol = m.getParameter('symbol', 'TKN');
	const myNft = m.contract('MyNft', [name, symbol]);
	return { myNft };
});

export default MyNftModule;
