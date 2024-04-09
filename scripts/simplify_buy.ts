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
    logger.info(`正在添加LP... network: ${network}, addr: ${addr}`);
    const [walletClient, buyWalletClient] = await hre.viem.getWalletClients();
    logger.info(`walletClient ${walletClient.account.address}`);
    // attach Simplify
    const Simplify_314 = await hre.viem.getContractAt(
      "Simplify_314",
      addr.Simplify_314,
      buyWalletClient
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
    logger.info(`before buy walletTokenBal: ${formatEther(walletTokenBal)}`);

    const _maxWallet = await Simplify_314.read._maxWallet();
    logger.info(`_maxWallet: ${formatEther(_maxWallet)}`);
    const buyAmount = await Simplify_314.read.getAmountOut([
      parseEther("0.01"),
      true,
    ]);
    logger.info(
      `buyAmount: ${formatEther(buyAmount)}  ${
        Number(formatEther(walletTokenBal)) + Number(formatEther(buyAmount)) <=
        Number(formatEther(_maxWallet))
      } ${
        Number(formatEther(walletTokenBal)) + Number(formatEther(buyAmount))
      } ${Number(formatEther(_maxWallet))}`
    );
    if (
      Number(formatEther(walletTokenBal)) + Number(formatEther(buyAmount)) <=
      Number(formatEther(_maxWallet))
    ) {
      logger.info(`start buy 0.01 ether`);

      await buyWalletClient.sendTransaction({
        to: Simplify_314.address,
        value: parseEther("0.01"),
      });

      bal = await publicClient.getBalance({
        address: buyWalletClient.account.address,
      });
      logger.info(`after buy buyWalletClient eth balance: ${formatEther(bal)}`);
      const simplifyBal2 = await Simplify_314.read.balanceOf([
        addr.Simplify_314,
      ]);
      logger.info(
        `after buy Simplify_314 balance2: ${formatEther(simplifyBal2)}`
      );
      walletTokenBal = await Simplify_314.read.balanceOf([
        buyWalletClient.account.address,
      ]);
      logger.info(`after buy walletTokenBal: ${formatEther(walletTokenBal)}`);
    } else {
      logger.info(
        `walletTokenBal ${formatEther(
          walletTokenBal
        )}  + buyAmount ${formatEther(buyAmount)} > _maxWallet ${formatEther(
          _maxWallet
        )}}
          `
      );
    }
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
