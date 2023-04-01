// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./interfaces/ITokenLock.sol";
import "./libraries/Roles.sol";

/**
 * @title TokenLock
 * @dev This contract locks tokens for a specified period of time
 * and then releases them to the beneficiary.
 */
contract TokenLock is 
	Initializable, 
	AccessControlUpgradeable, 
	UUPSUpgradeable, 
	ReentrancyGuardUpgradeable, 
	ITokenLock 
{
	IERC20Upgradeable private _lockToken;
	mapping(address => Schedule) public beneficiarySchedules;
	uint96 public totalTokenBalance;

	using SafeERC20Upgradeable for IERC20Upgradeable;

    /// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
        _disableInitializers();
    }
	
	/**
	 * @dev Initialize the contract with the token to lock
	 * @param _token 		The address of the token to lock
	 */
    function initialize(
		IERC20Upgradeable _token
	) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
		__ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Roles.UPGRADER_ROLE, msg.sender);

		_lockToken = _token;
    }

	/** 
	 * @dev Only DEFAULT_ADMIN_ROLE can call this function to set new token
	 * @param _newToken			The new token to lock
	 */
	function setToken(
		IERC20Upgradeable _newToken
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		address oldToken = address(_lockToken);
		_lockToken = _newToken;
		emit TokenChanged(oldToken, address(_newToken));
	}

	function getToken() external view returns(address) {
		return address(_lockToken);
	}

	/**
	 * @dev Create a batch of schedules
	 * @param _beneficiaries 	The addresses of the beneficiaries
	 * @param _amounts 			The amounts to lock for each beneficiary
	 * @param _releaseTime 		The release time in unix timestamp
	 * 
	 * Requirements:
	 * - `_beneficiaries` and `_amounts` must have the same length
	 * 
	 * Emits a {ScheduleBatchCreated} event.
	 */
	function createBatchSchedule(
		address[] calldata _beneficiaries,
		uint96[] calldata _amounts,
		uint64 _releaseTime	
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		uint beneficiariesLength = _beneficiaries.length;
		uint amountsLength = _amounts.length;
		require(beneficiariesLength == amountsLength, "TokenLock: beneficiaries and amounts length mismatch");

		for(uint i; i < beneficiariesLength;) {
			_createSchedule(_beneficiaries[i], _amounts[i], _releaseTime);
			unchecked {
				++i;
			}
		}
		emit ScheduleBatchCreated(_beneficiaries, _amounts, _releaseTime);
	}

	/**
	 * @dev Create a schedule
	 * @param _beneficiary 		The address of the beneficiary
	 * @param _amount 			The amount to lock
	 * @param _releaseTime 		The release time in unix timestamp
	 * 
	 * Emits a {ScheduleCreated} event.
	 */
	function createSchedule(
		address _beneficiary,
		uint96 _amount,
		uint64 _releaseTime
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		_createSchedule(_beneficiary, _amount, _releaseTime);
		emit ScheduleCreated(_beneficiary, _amount, _releaseTime);
	}

	/**
	 * @dev Internal function to create a schedule
	 * @param _beneficiary 		The address of the beneficiary
	 * @param _amount 			The amount to lock
	 * @param _releaseTime 		The release time in unix timestamp
	 * 
	 * Requirements:
	 * - `_beneficiary` cannot be the zero address
	 * - `_amount` cannot be 0
	 * - `_releaseTime` cannot be before current time
	 * - `_amount` must be approved by the sender
	 * - `_amount` must be transferred from the sender to this contract
	 * 
	 */
	function _createSchedule(
		address _beneficiary,
		uint96 _amount,
		uint64 _releaseTime
	) internal {
		require(_beneficiary != address(0), "TokenLock: beneficiary is the zero address");
		require(_amount > 0, "TokenLock: amount is 0");
		require(_releaseTime > block.timestamp, "TokenLock: release time is before than current time");
		Schedule storage schedule = beneficiarySchedules[_beneficiary];
		schedule.total = _amount;
		schedule.releaseTime = _releaseTime;
		totalTokenBalance += _amount;
	
		_lockToken.safeTransferFrom(_msgSender(), address(this), _amount);
	}

	/**
	 * @dev Release tokens to the beneficiary
	 * @param _amount 			The amount to release
	 * 
	 * Requirements:
	 * - `_amount` cannot be 0
	 * - `_amount` must be less than or equal to the available balance
	 * - current time must be greater than or equal to the release time
	 * 
	 * Emits a {Released} event.
	 */
	function release(
		uint96 _amount
	) external nonReentrant {
		address _sender = _msgSender();
		require(_amount > 0, "TokenLock: amount is 0");
		require(_amount <= _availableBalance(_msgSender()), "TokenLock: amount is exceeding available balance");
		Schedule memory schedule = beneficiarySchedules[_sender];
		require(schedule.releaseTime <= block.timestamp, "TokenLock: current time is before than release time");
		_lockToken.safeTransfer(_sender, _amount);
		schedule.released += _amount;

		
		totalTokenBalance -= _amount;
		beneficiarySchedules[_sender] = schedule;

		emit Released(_sender, _amount);
	}
	/**
	 * @dev See {_availableBalance}
	 * @param _beneficiary 		The address of the beneficiary
	 * @return 					The available balance of the beneficiary
	 */
	function availableBalance(address _beneficiary) external view returns(uint96) {
		return _availableBalance(_beneficiary);
	}
	/**
	 * @dev Internally get the available balance of the beneficiary
	 * @param _beneficiary 		The address of the beneficiary
	 * @return 					The available balance of the beneficiary
	 */
	function _availableBalance(address _beneficiary) internal view returns(uint96) {
		Schedule memory schedule = beneficiarySchedules[_beneficiary];
		if(schedule.released >= schedule.total) {
			return 0;
		}
		uint96 available = schedule.total - schedule.released;
		if(available > totalTokenBalance) {
			return totalTokenBalance;
		}
		return available;
	}
	
	/**
	 * @dev Upgrade the contract
	 * @param newImplementation The address of the new implementation
	 */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(Roles.UPGRADER_ROLE)
        override
    {}
}