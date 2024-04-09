const fs = require("fs");
const path = require("path");
const logger1 = require("pino")({
  transport: {
    target: "pino-pretty",
  },
});
const addressFile = path.resolve(__dirname, "../config/addresses.json");

async function sleep(_time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, _time);
  });
}

async function updateAddress(
  network: string,
  name: string,
  address: string,
  file = addressFile
) {
  try {
    const data = await fs.readFileSync(file, "utf8");
    // 将文件内容解析为JavaScript对象
    let config = JSON.parse(data);
    // 修改testnet.weth的值
    // config.testnet.weth = '0xNewAddressHere';
    if (config[network] === undefined) {
      config[network] = {};
    }
    config[network][name] = address;

    // 创建一个新的文件内容字符串
    const newContent = JSON.stringify(config, null, 4);
    await fs.writeFileSync(file, newContent, "utf8");
    logger1.info(
      `${file
        .toString()
        .substring(
          file.toString().lastIndexOf("/") + 1
        )} updated ${network} ${name} ${address} successfully`
    );
  } catch (error) {
    console.log("error", error);
  }
}

module.exports = {
  sleep,
  updateAddress,
};
