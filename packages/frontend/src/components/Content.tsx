import { Layout } from 'antd';
import MyComponent from './MyComponent';

const Content = () => {
	return (
		<Layout.Content style={{ textAlign: 'left', padding: 100 }}>
			<MyComponent />
			<h1>Welcome to HonestNFT!</h1>
			<h2>Where Trust as Code Ensures Fairness and Prevents Insider Trading</h2>

			<h3>About HonestNFT</h3>
			<p>
				HonestNFT is committed to integrity and transparency in the NFT space. We prioritize fairness and trust,
				ensuring that every digital asset on our platform is authentic and free from manipulation.
			</p>

			<h3>Trustworthy Mechanisms</h3>
			<ul>
				<li>
					<strong>Provenance Hash:</strong> Each NFT comes with a provenance hash, guaranteeing the
					authenticity of its metadata. This cryptographic assurance ensures that the associated information
					remains untampered with and trustworthy.
				</li>
				<li>
					<strong>Trustworthy Minting:</strong> Our minters are selected through a lottery system powered by
					Chainlink VRF, a trusted and transparent random number generator. This ensures an unbiased and
					equitable distribution of NFTs, preventing any potential insider advantages.
				</li>
				<li>
					<strong>Secure Metadata Handling:</strong> The metadata URL is kept confidential until the reveal,
					preventing insider trading by ensuring that information is not available to select individuals
					before the general public. This commitment to secrecy maintains the integrity of the metadata
					associated with each NFT.
				</li>
				<li>
					<strong>Trusted Metadata Offset:</strong> At the reveal, the metadata offset is determined using
					Chainlink VRF, safeguarding the assignment of token IDs from manipulation and preventing insider
					trading. This ensures a fair and transparent distribution of token IDs.
				</li>
			</ul>
		</Layout.Content>
	);
};

export default Content;
