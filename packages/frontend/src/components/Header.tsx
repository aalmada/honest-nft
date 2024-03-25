import { Layout, Flex } from 'antd';
import { ConnectKitButton } from 'connectkit';

const Header = () => {
    return <Layout.Header>
        <Flex justify='flex-end' align='center'>
            <ConnectKitButton />
        </Flex>
    </Layout.Header>
}

export default Header