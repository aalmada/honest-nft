// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { BitMaps } from "@openzeppelin/contracts/utils/structs/BitMaps.sol";

/**
 * @dev Contract module which allows children to implement an ID claiming mechanism.
 */
abstract contract ClaimsHandler is Context {
	mapping(bytes32 => BitMaps.BitMap) private _claimed;

    /**
     * @dev Gets the current validator.
     */
	bytes32 public validator;

    /**
     * @dev Emitted when the validator value is set.
     */
	event ValidatorChanged(address indexed account, bytes32 validator);

    /**
     * @dev Emitted when an ID is claimed.
     */
	event Claimed(address indexed account, uint256 indexed id);

    /**
     * @dev The operation failed because the claiming is enabled.
     */
	error EnforceValidator();

    /**
     * @dev The operation failed because the claiming is disabled.
     */
	error ExpectedValidator();

    /**
     * @dev The operation failed because the proof is not valid.
     */
	error InvalidProof(uint256 id, bytes32[] proof);

    /**
     * @dev The operation failed because the ID is already claimed.
     */
	error AlreadyClaimed(uint256 id);

    /**
     * @dev Sets the validator against which the claims are verified.
     * 
     * Set to 0 to disable claiming.
	 * 
	 * Requirements:
	 * 
	 * - The current validator must be 0 to set to a different value.
	 * 
	 */
	function _setValidator(bytes32 _validator) internal {
        if (validator != 0 && _validator != 0) revert EnforceValidator();
		validator = _validator;
		emit ValidatorChanged(_msgSender(), validator);
	}

    /**
     * @dev Returns whether the ID has been claimed.
     */
	function claimingEnabled() public view returns (bool) {
		return validator != 0;
	}

    /**
     * @dev Claim an ID given a proof.
     *
     * Requirements:
     *
     * - The claiming must be enabled.
     */
	function _claim(uint256 id, bytes32[] calldata proof) internal whenClaimingEnabled {
		if (claimed(validator, id)) revert AlreadyClaimed(id);
		if (!_verify(_leaf(_msgSender(), id), proof)) revert InvalidProof(id, proof);
		BitMaps.set(_claimed[validator], id);
		emit Claimed(_msgSender(), id);
	}

    /**
     * @dev Returns whether the ID has been claimed.
     */
	function claimed(bytes32 _validator, uint256 id) public view returns (bool) {
		return BitMaps.get(_claimed[_validator], id);
	}

	function _leaf(address account, uint256 id) private pure returns (bytes32) {
		return keccak256(abi.encodePacked(id, account));
	}

	function _verify(bytes32 leaf, bytes32[] memory proof) private view returns (bool)
	{
		return MerkleProof.verify(proof, validator, leaf);
	}

    /**
     * @dev Modifier to make a function callable only when the claiming is enabled.
     *
     * Requirements:
     *
     * - The claiming must be enabled.
     */
    modifier whenClaimingEnabled() {
        _requireClaimingEnabled();
        _;
    }

    /**
     * @dev Throws if the claiming is disabled.
     */
    function _requireClaimingEnabled() internal view virtual {
        if (validator == 0) {
            revert ExpectedValidator();
        }
    }

}