async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.getBalance()).toString()
  );

  const ProofEd = await ethers.getContractFactory("ProofEd", deployer);
  const proofEd = await ProofEd.deploy();

  await proofEd.deployed();

  console.log("ProofEd deployed to:", proofEd.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

