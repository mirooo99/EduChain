import hre from "hardhat";

async function main() {
  console.log("Deploying Certificate contract to Sepolia...");

  const Certificate = await hre.ethers.getContractFactory("Certificate");
  
  const certificate = await Certificate.deploy();

  await certificate.waitForDeployment();

  const contractAddress = await certificate.getAddress();

  console.log(`Success! Certificate contract deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
