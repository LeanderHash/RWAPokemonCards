import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:mintCard")
  .addParam("address", "Contract address")
  .addParam("name", "Card name")
  .addParam("image", "Image URI")
  .addParam("level", "Card level")
  .addParam("hp", "Card HP")
  .addParam("attack", "Card attack")
  .addParam("defense", "Card defense")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const signers = await ethers.getSigners();

    const rwaPokemonCardsFactory = await ethers.getContractFactory("RWAPokemonCards");
    const rwaPokemonCards = rwaPokemonCardsFactory.attach(taskArguments.address);

    // Create encrypted input
    const input = fhevm.createEncryptedInput(taskArguments.address, signers[0].address);
    input.add32(Number(taskArguments.level));
    input.add32(Number(taskArguments.hp));
    input.add32(Number(taskArguments.attack));
    input.add32(Number(taskArguments.defense));
    input.addAddress(signers[0].address);
    const encryptedInput = await input.encrypt();

    const transaction = await rwaPokemonCards.mintCard(
      taskArguments.name,
      taskArguments.image,
      encryptedInput.handles[0], // level
      encryptedInput.handles[1], // hp
      encryptedInput.handles[2], // attack
      encryptedInput.handles[3], // defense
      encryptedInput.handles[4], // encrypted owner
      encryptedInput.inputProof,
    );

    await transaction.wait();
    console.log(`Transaction: ${transaction.hash}`);
  });

task("task:getCard")
  .addParam("address", "Contract address")
  .addParam("tokenid", "Token ID")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();

    const rwaPokemonCardsFactory = await ethers.getContractFactory("RWAPokemonCards");
    const rwaPokemonCards = rwaPokemonCardsFactory.attach(taskArguments.address);

    const card = await rwaPokemonCards.getCard(taskArguments.tokenid);
    console.log(`Card Name: ${card.cardName}`);
    console.log(`Image URI: ${card.imageURI}`);
    console.log(`Level: ${card.level}`);
    console.log(`HP: ${card.hp}`);
    console.log(`Attack: ${card.attack}`);
    console.log(`Defense: ${card.defense}`);
    console.log(`Encrypted Owner: ${card.encryptedOwner}`);
  });

task("task:transferCard")
  .addParam("address", "Contract address")
  .addParam("tokenid", "Token ID")
  .addParam("to", "Recipient address")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const signers = await ethers.getSigners();

    const rwaPokemonCardsFactory = await ethers.getContractFactory("RWAPokemonCards");
    const rwaPokemonCards = rwaPokemonCardsFactory.attach(taskArguments.address);

    // Create encrypted input for current owner and new owner
    const input = fhevm.createEncryptedInput(taskArguments.address, signers[0].address);
    input.addAddress(signers[0].address); // current owner
    input.addAddress(taskArguments.to);   // new owner
    const encryptedInput = await input.encrypt();

    const transaction = await rwaPokemonCards.transfer(
      taskArguments.tokenid,
      taskArguments.to,
      encryptedInput.handles[0], // encrypted current owner
      encryptedInput.handles[1], // encrypted new owner
      encryptedInput.inputProof,
    );

    await transaction.wait();
    console.log(`Transaction: ${transaction.hash}`);
  });

task("task:decryptLevel")
  .addParam("address", "Contract address")
  .addParam("tokenid", "Token ID")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const signers = await ethers.getSigners();

    const rwaPokemonCardsFactory = await ethers.getContractFactory("RWAPokemonCards");
    const rwaPokemonCards = rwaPokemonCardsFactory.attach(taskArguments.address);

    const card = await rwaPokemonCards.getCard(taskArguments.tokenid);

    const decryptedLevel = await fhevm.userDecryptEuint(
      fhevm.FhevmType.euint32,
      card.level,
      taskArguments.address,
      signers[0]
    );

    console.log(`Decrypted Level: ${decryptedLevel}`);
  });