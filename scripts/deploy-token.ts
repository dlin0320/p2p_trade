import { ethers } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();
  const MyToken = await ethers.getContractFactory('MyToken', owner);
  const token = await MyToken.deploy();
  await token.deployed();
  
  console.log(`token deployed to ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
