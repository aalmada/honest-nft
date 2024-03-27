import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Honest NFT',
	description: 'The client site for Honest NFT'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AntdRegistry>{children}</AntdRegistry>
			</body>
		</html>
	);
};

export default RootLayout;
