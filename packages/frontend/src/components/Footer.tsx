import { Layout, Typography } from 'antd';

const { Link } = Typography;

const Footer = () => {
	return (
		<Layout.Footer style={{ textAlign: 'center' }}>
			Honest NFT Smith ©{new Date().getFullYear()} Created by{' '}
			<Link href="https://aalmada.github.io/" target="_blank">
				Antão Almada
			</Link>
		</Layout.Footer>
	);
};

export default Footer;
