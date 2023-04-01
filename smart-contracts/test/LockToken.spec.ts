import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { keccak256, parseEther } from "../helpers/ether-helper";
import { getUnixTime } from "date-fns";
import { time } from "@nomicfoundation/hardhat-network-helpers";

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
    let owner: SignerWithAddress,
      amount: BigNumber,
      future: number,
      past: number,
      tokenContract: Contract,
      lockContract: Contract;
    beforeEach(async function () {
      ({ owner, tokenContract, lockContract } = await loadFixture(
        deployFixture
      ));
      amount = parseEther(500);
      future = getUnixTime(
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
      );
      past = getUnixTime(
        new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3)
      );
    });
    describe("Create batch schedules", function () {
      describe("And going to be rejected because", function () {
        it(" Miss match length of `_beneficiaries` and `_amounts` => rejected", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createBatchSchedule(
              [beneficiary.address],
              [amount.toString(), amount.toString()],
              future
            )
          ).to.be.revertedWith(
            "TokenLock: beneficiaries and amounts length mismatch"
          );
        });
      });
    });
    describe("Create a schedule", function () {
      describe("And going to be rejected because", function () {
        it("caller does not have admin role => rejected", async function () {
          const [, caller, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract
              .connect(caller)
              .createSchedule(beneficiary.address, amount.toString(), future)
          ).to.be.revertedWith(
            getErrorUnauthorized(caller.address, DEFAULT_ADMIN_ROLE)
          );
        });
        it("Argument `_beneficiary` is zero address => rejected", async function () {
          const addressZero = ethers.constants.AddressZero;
          await expect(
            lockContract.createSchedule(
              addressZero.toString(),
              amount.toString(),
              future
            )
          ).to.be.revertedWith("TokenLock: beneficiary is the zero address");
        });
        it("Argument `_amount` is zero => rejected", async function () {
          const [, beneficiary] = await ethers.getSigners();
          const zeroAmount = 0;
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              zeroAmount.toString(),
              future
            )
          ).to.be.revertedWith("TokenLock: amount is 0");
        });
        it("Argument `_releaseTime` is in the past", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              past
            )
          ).to.be.revertedWith(
            "TokenLock: release time is before than current time"
          );
        });
        it("Argument `_amount` token have not be approved before call", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              future
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
              future
            )
          )
            .to.emit(lockContract, "ScheduleCreated")
            .withArgs(beneficiary.address, amount.toString(), future);
        });
        it("new schedule is created", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await lockContract.createSchedule(
            beneficiary.address,
            amount.toString(),
            future
          );
          const schedule = await lockContract.beneficiarySchedules(
            beneficiary.address
          );
          expect(schedule.total).to.equal(amount);
          expect(schedule.released).to.equal(0);
          expect(schedule.releaseTime).to.equal(future);
        });
        it("total token locked is increased", async function () {
          const [, beneficiary] = await ethers.getSigners();
          const totalLockedBefore = await lockContract.totalTokenBalance();
          await lockContract.createSchedule(
            beneficiary.address,
            amount.toString(),
            future
          );
          const totalLocked = await lockContract.totalTokenBalance();
          expect(totalLocked).to.equal(totalLockedBefore.add(amount));
        });
        it("amount token is transferred to lock contract", async function () {
          const [, beneficiary] = await ethers.getSigners();
          await expect(
            lockContract.createSchedule(
              beneficiary.address,
              amount.toString(),
              future
            )
          ).to.changeTokenBalances(
            tokenContract,
            [owner, lockContract],
            [amount.mul(-1), amount]
          );
        });
      });
    });
  });
  describe("Release", function () {
    type Schedule = {
      amount: BigNumber;
      beneficiary: SignerWithAddress;
    };
    let schedules: Schedule[],
      tokenContract: Contract,
      lockContract: Contract,
      releasedTime: number;
    beforeEach(async function () {
      ({ tokenContract, lockContract } = await loadFixture(deployFixture));
      const [, beneficiary1, beneficiary2, beneficiary3] =
        await ethers.getSigners();
      schedules = new Array<Schedule>(3);
      releasedTime = getUnixTime(
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3)
      );
      schedules[0] = {
        amount: parseEther(100),
        beneficiary: beneficiary1,
      };
      schedules[1] = {
        amount: parseEther(200),
        beneficiary: beneficiary2,
      };
      schedules[2] = {
        amount: parseEther(300),
        beneficiary: beneficiary3,
      };
      const total = schedules.reduce(
        (acc, cur) => acc.add(cur.amount),
        BigNumber.from(0)
      );
      const listBeneficiary = schedules.map(
        (schedule) => schedule.beneficiary.address
      );
      const listAmount = schedules.map((schedule) =>
        schedule.amount.toString()
      );
      const txApprove = await tokenContract.approve(
        lockContract.address,
        total.toString()
      );
      await txApprove.wait();
      const txCreateScheduleBatch = await lockContract.createBatchSchedule(
        listBeneficiary,
        listAmount,
        releasedTime
      );
      await txCreateScheduleBatch.wait();
    });
    describe("And going to be rejected because", function () {
      it("Argument `_amount` is zero => rejected", async function () {
        const zeroAmount = 0;
        await expect(
          lockContract
            .connect(schedules[0].beneficiary)
            .release(zeroAmount.toString())
        ).to.be.revertedWith("TokenLock: amount is 0");
      });
      it("Argument `_amount` is greater than available balance => rejected", async function () {
        const amount = schedules[0].amount.add(100);
        await expect(
          lockContract
            .connect(schedules[0].beneficiary)
            .release(amount.toString())
        ).to.be.revertedWith(
          "TokenLock: amount is exceeding available balance"
        );
      });
      it("Current time is less than release time => rejected", async function () {
        const amount = schedules[0].amount;
        const tenMinutesInSecond = 10 * 60;
        await time.increaseTo(releasedTime - tenMinutesInSecond);
        await expect(
          lockContract
            .connect(schedules[0].beneficiary)
            .release(amount.toString())
        ).to.be.revertedWith(
          "TokenLock: current time is before than release time"
        );
      });
    });
    describe("And successfully released", function () {
      it("emit `Released` event", async function () {
        const amount = schedules[0].amount;
        await time.increaseTo(releasedTime);
        await expect(
          lockContract
            .connect(schedules[0].beneficiary)
            .release(amount.toString())
        )
          .to.emit(lockContract, "Released")
          .withArgs(schedules[0].beneficiary.address, amount.toString());
      });
      it("total token locked is decreased", async function () {
        const amount = schedules[0].amount;
        const totalLockedBefore = await lockContract.totalTokenBalance();
        await time.increaseTo(releasedTime);
        await lockContract
          .connect(schedules[0].beneficiary)
          .release(amount.toString());
        const totalLocked = await lockContract.totalTokenBalance();
        expect(totalLocked).to.equal(totalLockedBefore.sub(amount));
      });
      it("amount released is increased", async function () {
        const amount = schedules[0].amount;
        const schedule = await lockContract.beneficiarySchedules(
          schedules[0].beneficiary.address
        );
        const releasedBefore = schedule.released;
        await time.increaseTo(releasedTime);
        await lockContract
          .connect(schedules[0].beneficiary)
          .release(amount.toString());
        const scheduleAfter = await lockContract.beneficiarySchedules(
          schedules[0].beneficiary.address
        );
        const released = scheduleAfter.released;
        expect(released).to.equal(releasedBefore.add(amount));
      });
      it("amount token is transferred to beneficiary", async function () {
        const amount = schedules[0].amount;
        await time.increaseTo(releasedTime);
        await expect(
          lockContract
            .connect(schedules[0].beneficiary)
            .release(amount.toString())
        ).to.changeTokenBalances(
          tokenContract,
          [schedules[0].beneficiary, lockContract],
          [amount, amount.mul(-1)]
        );
      });
    });
  });
  describe("ACL call", function () {
    const getErrorUnauthorized = (address: string, role: string) => {
      return `AccessControl: account ${address.toLowerCase()} is missing role ${role}`;
    };
    describe("Set new token", function () {
      let tokenContract: Contract,
        token2Contract: Contract,
        lockContract: Contract,
        owner: SignerWithAddress;
      beforeEach(async function () {
        ({ owner, tokenContract, lockContract } = await loadFixture(
          deployFixture
        ));
        const [, deployer] = await ethers.getSigners();
        const tokenFactory = await ethers.getContractFactory(
          "ERC20Token",
          deployer
        );
        const tokenParams = ["SpiderBlock", "SPB"];
        token2Contract = await upgrades.deployProxy(tokenFactory, tokenParams);
        await token2Contract.deployed();
        await token2Contract.mint(owner.address, parseEther(1000));
      });
      describe("And going to be rejected because", function () {
        it("Caller is not owner => rejected", async function () {
          const [, caller] = await ethers.getSigners();
          await expect(
            lockContract.connect(caller).setToken(tokenContract.address)
          ).to.be.revertedWith(
            getErrorUnauthorized(caller.address, DEFAULT_ADMIN_ROLE)
          );
        });
      });
      describe("And successfully set", function () {
        it("emit `TokenChanged` event", async function () {
          await expect(lockContract.setToken(token2Contract.address))
            .to.emit(lockContract, "TokenChanged")
            .withArgs(tokenContract.address, token2Contract.address);
        });
        it("token address is changed", async function () {
          await lockContract.setToken(token2Contract.address);
          const tokenAddress = await lockContract.getToken();
          expect(tokenAddress).to.equal(token2Contract.address);
        });
      });
    });
  });
});
