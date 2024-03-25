import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

const config = createConfig(
	getDefaultConfig({
		chains: [mainnet],
		transports: {
			// RPC URL for each chain
			// [mainnet.id]: http(
			//   `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`,
			// ),
			[sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`)
		},

		// Required API Keys
		walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',

		// Required App Info
		appName: 'Honest NFT Smith',

		// Optional App Info
		appDescription: 'A simple NFT minting platform.',
		appUrl: 'https://family.co', // your app's url
		appIcon: 'https://family.co/logo.png' // your app's icon, no bigger than 1024x1024px (max. 1MB)
	})
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children?: ReactNode }) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>{children}</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
