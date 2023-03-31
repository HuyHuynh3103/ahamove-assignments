import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { keccak256, parseEther } from "../helpers/ether-helper";

describe("TokenLock", function () {
  const DEFAULT_ADMIN_ROLE =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  async function deployFixture() {
    const [deployer] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory(
      "ERC20Token",
      deployer
    );
    const tokenParams = ["SpiderBlock", "SPB"];
    const tokenContract = await upgrades.deployProxy(tokenFactory, tokenParams);
    await tokenContract.deployed();
    await tokenContract.mint(deployer.address, parseEther(1000000));
    const lockFactory = await ethers.getContractFactory("TokenLock", deployer);
    const lockParams = [tokenContract.address];
    const lockContract = await upgrades.deployProxy(lockFactory, lockParams);
    await lockContract.deployed();
    return {
      owner: deployer,
      tokenContract,
      lockContract,
    };
  }
  describe("Deployment", function () {
    it("set the `_token` to `_lockToken`, type uint256", async function () {
      const { tokenContract, lockContract } = await loadFixture(deployFixture);
      const lockToken = await lockContract.getToken();
      expect(lockToken).to.equal(tokenContract.address);
    });
    it("authorize `deployer` to default admin role ", async function () {
      const { owner, lockContract } = await loadFixture(deployFixture);
      expect(
        await lockContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
      ).to.be.equal(true);
    });
    it("authorize `deployer` to upgrader role", async function () {
      const { owner, lockContract } = await loadFixture(deployFixture);
      expect(
        await lockContract.hasRole(UPGRADER_ROLE, owner.address)
      ).to.be.equal(true);
    });
  });
  describe("CreateSchedule", function () {
    const getErrorUnauthorized = (address: string, role: string) => {
      return `AccessControl: account ${address.toLowerCase()} is missing role ${role}`;
    };
    let amount: BigNumber,
      future: Date,
      past: Date,
      tokenContract: Contract,
      lockContract: Contract;
    beforeEach(async function () {
      ({ tokenContract, lockContract } = await loadFixture(
        deployFixture
      ));
      amount = parseEther(500);
      future = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3);
      past = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3);
    });
    describe("Create batch schedules", function () {});
    describe("Create a schedule", function () {
      describe("And rejected because", function () {
        it("caller does not have admin role => rejected", async function () {
          const [, caller, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract
              .connect(caller)
              .createSchedule(
                beneficiary.address,
                amount.toString(),
                future.getTime()
              )
          ).to.be.revertedWith(
            getErrorUnauthorized(caller.address, DEFAULT_ADMIN_ROLE)
          );
        });
        it("`_beneficiary` is zero address => rejected", async function () {
          const addressZero = ethers.constants.AddressZero;
          await expect(
            lockContract.createSchedule(
              addressZero.toString(),
              amount.toString(),
              future.getTime()
            )
          ).to.be.revertedWith("TokenLock: beneficiary is the zero address");
        });
        it("`_amount` is zero => rejected", async function () {
          const [, beneficiary] = await ethers.getSigners();
          const zeroAmount = parseEther(0);
          await expect(
			  lockContract.createSchedule(
              beneficiary.address,
              zeroAmount.toString(),
              future.getTime()
            )
          ).to.be.revertedWith("TokenLock: amount is 0");
        });
        it("`_releaseTime` is in the past", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              past.getTime()
            )
          ).to.be.revertedWith("TokenLock: amount is 0");
        });
        it("`_amount` token have not be approved before call", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              future.getTime()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
      describe("And new schedule is created", function () {
        beforeEach(async function () {
          await tokenContract.approve(lockContract.address, amount);
        });
        it("emit `ScheduleCreated` event", async function () {
          const [, beneficiary] = await ethers.getSigners();

          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              future.getTime()
            )
          )
            .to.emit(lockContract, "ScheduleCreated")
            .withArgs(beneficiary.address, amount.toString(), future.getTime());
        });
      });
    });
  });
  describe("Release", function () {});
  describe("ACL call", function () {});
});
