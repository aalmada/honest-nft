import { Layout, Flex } from 'antd';
import { ConnectKitButton } from 'connectkit';

const Header = () => {
	return (
		<Layout.Header
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 1,
				width: '100%',
				display: 'flex',
				alignItems: 'center'
			}}
		>
			<Flex justify="flex-end" align="center">
				<ConnectKitButton />
			</Flex>
		</Layout.Header>
	);
};

export default Header;
