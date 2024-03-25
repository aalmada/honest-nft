// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import '@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol';

contract HonestNft is ERC721, ERC721Pausable, AccessControlEnumerable {
	bytes32 public immutable ADMIN_ROLE = keccak256('ADMIN_ROLE');
	bytes32 public immutable MANAGER_ROLE = keccak256('MANAGER_ROLE');

	constructor() ERC721('HonestNFT', 'HNST') {
		_setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
		_setRoleAdmin(MANAGER_ROLE, ADMIN_ROLE);

		grantRole(ADMIN_ROLE, _msgSender());
	}

	function pause() public onlyRole(ADMIN_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(ADMIN_ROLE) {
		_unpause();
	}

	// The following functions are overrides required by Solidity.

	function _update(
		address to,
		uint256 tokenId,
		address auth
	) internal override(ERC721, ERC721Pausable) returns (address) {
		return super._update(to, tokenId, auth);
	}

	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC721, AccessControlEnumerable) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}
