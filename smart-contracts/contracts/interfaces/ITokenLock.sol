//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

interface ITokenLock {
	struct Schedule {
        uint96 total;
        uint96 released;
		uint64 releaseTime;
    }

	event TokenChanged(address _oldToken, address _newToken);
	event ScheduleBatchCreated(address[] _beneficiaries, uint96[] _amounts, uint64 _releaseTime);
	event ScheduleCreated(address _beneficiary, uint96 _amount, uint64 _releaseTime);
	event Released(address _beneficiary, uint96 _amount);

	function getToken() external view returns(address);

	/**
	 * @dev Initialize the contract with the token to lock
	 * @param _token The token to lock
	 */
	function initialize(
		IERC20Upgradeable _token
	) external;

	/**
	 * @dev Release the tokens for the beneficiary
	 * @param _amount The address of the beneficiary
	 */
	function release(
		uint96 _amount
	) external;
	
	/**
	 * @dev Set the token to lock
	 * @param _newToken The new token to lock
	 */
	function setToken(
		IERC20Upgradeable _newToken
	) external;
	function createBatchSchedule(
		address[] calldata _beneficiaries,
		uint96[] calldata _amounts,
		uint64 _releaseTime	
	) external;

	function createSchedule(
		address _beneficiary,
		uint96 _amount,
		uint64 _releaseTime	
	) external;
}