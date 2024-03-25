import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  import { getAddress, parseGwei } from "viem";
  
  describe("HonestNft", function () {

    async function deployFixture() {
      const [owner, otherAccount] = await hre.viem.getWalletClients();
  
      const honestNft = await hre.viem.deployContract("HonestNft");
  
      const publicClient = await hre.viem.getPublicClient();
  
      return {
        honestNft,
        owner,
        otherAccount,
        publicClient,
      };
    }
  
    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { honestNft, owner } = await loadFixture(deployFixture);
  
        expect(await honestNft.read.owner()).to.equal(
          getAddress(owner.account.address)
        );
      });
    });
});