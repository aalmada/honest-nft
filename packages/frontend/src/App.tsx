import './App.css';
import { Layout, ConfigProvider, theme } from 'antd';
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';

const App = () => {
	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm
			}}
		>
			<Layout>
				<Header />
				<Content />
				<Footer />
			</Layout>
		</ConfigProvider>
	);
};

export default App;
