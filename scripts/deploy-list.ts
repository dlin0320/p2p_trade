import { ethers } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const List = await ethers.getContractFactory('List', owner);
  const list = await List.deploy();
  await list.deployed();
  
  console.log(`list deployed to ${list.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
