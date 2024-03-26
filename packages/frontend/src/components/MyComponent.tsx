import { useAccount } from 'wagmi';
import { TextAddress } from 'antd-web3';

// Make sure that this component is wrapped with ConnectKitProvider
const MyComponent = () => {
	const { address, isConnecting, isDisconnected } = useAccount();
	if (isConnecting) return <div>Connecting...</div>;
	if (isDisconnected) return <div>Disconnected</div>;
	return (
		<div>
			Connected Wallet: <TextAddress address={address} />
		</div>
	);
};

export default MyComponent;
