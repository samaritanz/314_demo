const addresses = require("../config/addresses.json");
const { updateAddress } = require("../utils");

const logger = require("pino")({
  transport: {
    target: "pino-pretty",
  },
});
async function main() {
  try {
    const network = hre.network.name;
    const addr = addresses[network];
    const [walletClient, buyWalletClient] = await hre.viem.getWalletClients();
    logger.info(`walletClient ${walletClient.account.address}`);
    // deploy Simplify
    const simplify = await hre.viem.deployContract("Simplify_314", [], {
      client: walletClient,
      confirmations: 1,
    });
    logger.info(`simplify deploy address: ${simplify.address}`);
    updateAddress(network, "Simplify_314", simplify.address);
  } catch (error) {
    console.error(error);
  }
}
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  // process.exitCode = 1;
  process.exit(1);
});
