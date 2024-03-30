// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Contract module which allows children to implement an revealer mechanism.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotRevealed` and `whenRevealed`, which can be applied to
 * the functions of your contract. Note that they will not be revealable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Revealable is Context {
    bool public revealed;

    /**
     * @dev Emitted when the reveal is triggered by `account`.
     */
    event Revealed(address account);

    /**
     * @dev The operation failed because the contract is revealed.
     */
    error EnforcedReveal();

    /**
     * @dev The operation failed because the contract is not revealed.
     */
    error ExpectedReveal();

    /**
     * @dev Initializes the contract in not revealed state.
     */
    constructor() {
        revealed = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not revealed.
     *
     * Requirements:
     *
     * - The contract must not be revealed.
     */
    modifier whenNotRevealed() {
        _requireNotRevealed();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is revealed.
     *
     * Requirements:
     *
     * - The contract must be revealed.
     */
    modifier whenRevealed() {
        _requireRevealed();
        _;
    }

    /**
     * @dev Throws if the contract is revealed.
     */
    function _requireNotRevealed() internal view virtual {
        if (revealed) {
            revert EnforcedReveal();
        }
    }

    /**
     * @dev Throws if the contract is not revealed.
     */
    function _requireRevealed() internal view virtual {
        if (!revealed) {
            revert ExpectedReveal();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be revealed.
     */
    function _reveal() internal virtual whenNotRevealed {
        revealed = true;
        emit Revealed(_msgSender());
    }
}