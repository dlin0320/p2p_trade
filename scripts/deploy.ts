import { ethers } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const MyToken = await ethers.getContractFactory('MyToken', owner);
  const token = await MyToken.deploy();
  await token.deployed();
  const List = await ethers.getContractFactory('List', owner);
  const list = await List.deploy();
  await list.deployed();
  
  console.log('contracts deployed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
