const hre = require("hardhat");
const addresses = require("../config/addresses.json");
import { parseEther, formatEther } from "viem";

const logger = require("pino")({
  transport: {
    target: "pino-pretty",
  },
});
const _block_terms = 5000;

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
      walletClient
    );
    logger.info(`Simplify_314 address: ${Simplify_314.address}`);
    // get block number
    const publicClient = await hre.viem.getPublicClient();
    const blockNumber = await publicClient.getBlockNumber();
    logger.info(`blockNumber: ${blockNumber}`);
    const _blockToUnlockLiquidity = Number(blockNumber) + _block_terms;
    logger.info(`_blockToUnlockLiquidity: ${_blockToUnlockLiquidity}`);
    // await Simplify_314.write.addLiquidity([String(_blockToUnlockLiquidity)], {
    //   client: walletClient,
    //   confirmations: 1,
    //   value: parseEther("10"),
    // });
    // logger.info(`正在添加LP... wallet: ${wallet.address}`);
    const bal = await publicClient.getBalance({
      address: walletClient.account.address,
    });
    logger.info(`walletClient balance: ${formatEther(bal)}`);
    // get simplify balance
    const simplifyBal = await publicClient.getBalance({
      address: Simplify_314.address,
    });
    logger.info(`Simplify_314 balance: ${formatEther(simplifyBal)}`);
    const simplifyBal2 = await Simplify_314.read.balanceOf([addr.Simplify_314]);
    logger.info(`Simplify_314 balance2: ${formatEther(simplifyBal2)}`);
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
