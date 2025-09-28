import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { RWAPokemonCards, RWAPokemonCards__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("RWAPokemonCards")) as RWAPokemonCards__factory;
  const contract = (await factory.deploy()) as RWAPokemonCards;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("RWAPokemonCards on Sepolia", function () {
  let signers: Signers;
  let contract: RWAPokemonCards;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2], carol: ethSigners[3] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against Sepolia testnet
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite is for Sepolia testnet only`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should mint a new Pokemon card on Sepolia", async function () {
    const input = fhevm.createEncryptedInput(contractAddress, signers.alice.address);
    input.add32(50); // level
    input.add32(120); // hp
    input.add32(80); // attack
    input.add32(60); // defense
    input.addAddress(signers.alice.address); // encrypted owner
    const encryptedInput = await input.encrypt();

    const tx = await contract.mintCard(
      "Pikachu",
      "https://example.com/pikachu.png",
      encryptedInput.handles[0], // level
      encryptedInput.handles[1], // hp
      encryptedInput.handles[2], // attack
      encryptedInput.handles[3], // defense
      encryptedInput.handles[4], // encrypted owner
      encryptedInput.inputProof,
    );

    await tx.wait();

    const totalSupply = await contract.totalSupply();
    expect(totalSupply).to.equal(1);

    const balance = await contract.balanceOf(signers.alice.address);
    expect(balance).to.equal(1);

    const owner = await contract.ownerOf(1);
    expect(owner).to.equal(signers.alice.address);
  });

  it("should transfer card with encrypted owner verification on Sepolia", async function () {
    const input = fhevm.createEncryptedInput(contractAddress, signers.alice.address);
    input.add32(50); // level
    input.add32(120); // hp
    input.add32(80); // attack
    input.add32(60); // defense
    input.addAddress(signers.alice.address); // encrypted owner
    const encryptedInput = await input.encrypt();

    await contract.mintCard(
      "Pikachu",
      "https://example.com/pikachu.png",
      encryptedInput.handles[0],
      encryptedInput.handles[1],
      encryptedInput.handles[2],
      encryptedInput.handles[3],
      encryptedInput.handles[4],
      encryptedInput.inputProof,
    );

    // Transfer from Alice to Bob
    const transferInput = fhevm.createEncryptedInput(contractAddress, signers.alice.address);
    transferInput.addAddress(signers.alice.address); // current encrypted owner
    transferInput.addAddress(signers.bob.address);   // new encrypted owner
    const encryptedTransferInput = await transferInput.encrypt();

    const tx = await contract.transfer(
      1,
      signers.bob.address,
      encryptedTransferInput.handles[0], // encrypted current owner
      encryptedTransferInput.handles[1], // encrypted new owner
      encryptedTransferInput.inputProof,
    );

    await tx.wait();

    const newOwner = await contract.ownerOf(1);
    expect(newOwner).to.equal(signers.bob.address);

    const aliceBalance = await contract.balanceOf(signers.alice.address);
    expect(aliceBalance).to.equal(0);

    const bobBalance = await contract.balanceOf(signers.bob.address);
    expect(bobBalance).to.equal(1);
  });

  it("should decrypt card stats for owner on Sepolia", async function () {
    const input = fhevm.createEncryptedInput(contractAddress, signers.alice.address);
    input.add32(75); // level
    input.add32(150); // hp
    input.add32(95); // attack
    input.add32(70); // defense
    input.addAddress(signers.alice.address); // encrypted owner
    const encryptedInput = await input.encrypt();

    await contract.mintCard(
      "Charizard",
      "https://example.com/charizard.png",
      encryptedInput.handles[0],
      encryptedInput.handles[1],
      encryptedInput.handles[2],
      encryptedInput.handles[3],
      encryptedInput.handles[4],
      encryptedInput.inputProof,
    );

    const card = await contract.getCard(1);

    const decryptedLevel = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      card.level,
      contractAddress,
      signers.alice
    );
    expect(decryptedLevel).to.equal(75);

    const decryptedHp = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      card.hp,
      contractAddress,
      signers.alice
    );
    expect(decryptedHp).to.equal(150);
  });
});