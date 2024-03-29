// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { Revealable } from "./Revealable.sol";

contract MyNft is ERC721, Pausable, Revealable, AccessControlEnumerable {
	bytes32 public immutable ADMIN_ROLE = keccak256("ADMIN_ROLE");
	bytes32 public immutable MANAGER_ROLE = keccak256("MANAGER_ROLE");
	uint256 public immutable MAX_SUPPLY;
	string public baseURI;
	uint256 private _nextTokenId;

	error ArgumentOutOfRange(string argName, uint256 actualValue);
	error ArgumentEmpty(string argName);
	error NotSupported();
	error OutOfStock();

	constructor(
		string memory name,
		string memory symbol,
		string memory notRevealedBaseURI,
		uint256 maxSupply
	) ERC721(name, symbol) {
		if (bytes(name).length == 0) revert ArgumentEmpty("name");
		if (bytes(symbol).length == 0) revert ArgumentEmpty("symbol");
		if (bytes(notRevealedBaseURI).length == 0) revert ArgumentEmpty("notRevealedBaseURI");
		if (maxSupply == 0) revert ArgumentOutOfRange("maxSupply", maxSupply);

		// set ADMIN_ROLE as the admin of all roles
		_setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
		_setRoleAdmin(MANAGER_ROLE, ADMIN_ROLE);

		// set the deployer as the default admin
		_grantRole(ADMIN_ROLE, _msgSender());

		baseURI = notRevealedBaseURI;
		MAX_SUPPLY = maxSupply;

		// starts paused
		_pause();
	}

	function _baseURI() internal view override returns (string memory) {
		return baseURI;
	}

	function reveal(string memory revealedBaseURI) public onlyRole(ADMIN_ROLE) whenNotRevealed {
		if (bytes(revealedBaseURI).length == 0) revert ArgumentEmpty("revealedBaseURI");

		baseURI = revealedBaseURI;
		_reveal();
	}

	function pause() public onlyRole(ADMIN_ROLE) {
		_pause();
	}

	function unpause() public onlyRole(ADMIN_ROLE) {
		_unpause();
	}

	function revokeRole(bytes32 role, address account) public virtual override(AccessControl, IAccessControl) onlyRole(getRoleAdmin(role)) {
		if(account == _msgSender()) revert NotSupported();
		
		super.revokeRole(role, account);
	}

	function renounceRole(bytes32, address) public virtual override(AccessControl, IAccessControl) {
		revert NotSupported();
	}

	function safeMint(address to) public onlyRole(ADMIN_ROLE) whenNotPaused {
		uint256 tokenId = _nextTokenId++;
		if (tokenId >= MAX_SUPPLY) 
			revert OutOfStock();

		_safeMint(to, tokenId);
	}

	// The following functions are overrides required by Solidity.

	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC721, AccessControlEnumerable) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}
