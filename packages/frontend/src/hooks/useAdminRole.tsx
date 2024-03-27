import { useQuery } from '@tanstack/react-query';

const fetchAdminRole = (contract: MyNft) => contract.ADMIN_ROLE();

const useAdminRole = (contract: MyNft | undefined) => {
	const { data, ...result } = useQuery([`my-nft-admin-role`, contract?.address], () => fetchAdminRole(contract!), {
		enabled: !!contract,
		cacheTime: Infinity
	});

	return { adminRole: data, ...result };
};

export default useAdminRole;
