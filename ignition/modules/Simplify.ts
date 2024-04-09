import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const SimplifyModule = buildModule("SimplifyModule", (m) => {
  const simplify = m.contract("Simplify_314", []);

  return { simplify };
});

export default SimplifyModule;
