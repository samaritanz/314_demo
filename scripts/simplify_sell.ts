const hre = require("hardhat");
const addresses = require("../config/addresses.json");
import { parseEther, formatEther } from "viem";

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
    // attach Simplify
    const Simplify_314 = await hre.viem.getContractAt(
      "Simplify_314",
      addr.Simplify_314,
      { client: { wallet: buyWalletClient } }
    );
    logger.info(`Simplify_314 address: ${Simplify_314.address}`);
    // get block number
    const publicClient = await hre.viem.getPublicClient();

    let bal = await publicClient.getBalance({
      address: buyWalletClient.account.address,
    });
    logger.info(`buyWalletClient eth balance: ${formatEther(bal)}`);
    // get simplify balance
    let simplifyBal = await publicClient.getBalance({
      address: Simplify_314.address,
    });
    logger.info(`Simplify_314 balance: ${formatEther(simplifyBal)}`);
    let walletTokenBal = await Simplify_314.read.balanceOf([
      buyWalletClient.account.address,
    ]);
    logger.info(`before sell walletTokenBal: ${formatEther(walletTokenBal)}`);
    let simplifyTokenBal = await Simplify_314.read.balanceOf([
      Simplify_314.address,
    ]);
    logger.info(
      `before sell simplifyTokenBal: ${formatEther(simplifyTokenBal)}`
    );

    const _maxWallet = await Simplify_314.read._maxWallet();
    logger.info(`_maxWallet: ${formatEther(_maxWallet)}`);
    const sellAmount = await Simplify_314.read.getAmountOut([
      parseEther("1000"),
      false,
    ]);
    logger.info(`sellAmount: ${formatEther(sellAmount)} `);

    logger.info(`start sell 1000 token`);

    await Simplify_314.write.transfer(
      [Simplify_314.address, parseEther("1000")],
      {
        client: { wallet: buyWalletClient },
        confirmations: 1,
      }
    );
    bal = await publicClient.getBalance({
      address: buyWalletClient.account.address,
    });
    logger.info(`after sell buyWalletClient eth balance: ${formatEther(bal)}`);
    const simplifyBal2 = await Simplify_314.read.balanceOf([addr.Simplify_314]);
    logger.info(
      `after sell Simplify_314 balance2: ${formatEther(simplifyBal2)}`
    );
    walletTokenBal = await Simplify_314.read.balanceOf([
      buyWalletClient.account.address,
    ]);
    logger.info(`after sell walletTokenBal: ${formatEther(walletTokenBal)}`);
    simplifyBal = await publicClient.getBalance({
      address: Simplify_314.address,
    });
    logger.info(`after sell Simplify_314 balance: ${formatEther(simplifyBal)}`);
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
