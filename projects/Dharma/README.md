# Project: Dharma

This script generates the 2,833 supplied accounts corresponding to impacted Dharma users. It retrieves the account addresses of all deployed user wallets by pulling logs from the Dharma Smart Wallet factory contract, then filters out all addresses that are not present in the "proxy" set in `data/source/valid-accounts`.

```javascript
const Web3 = require('web3');
const web3 = new Web3(
  `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
);
const fs = require('fs');

const VALID_ACCOUNTS_FILE = "./valid-accounts.txt"; // List of all candidate accounts

const getParsedLogs = async (abi, unparsedLogs) => {
  const logTopicsArray = abi.filter(item => item.type === "event").map(item => {
    const key = web3.utils.keccak256(
      item.name + '(' + item.inputs.map(input => input.type).join(',') + ')'
    );
    return {
      [key]: item
    };
  });

  let logTopics = {};
  logTopicsArray.forEach(logTopic => {
    logTopics[Object.keys(logTopic)[0]] = Object.values(logTopic)[0]
  });

  const parsedLogs = await Promise.all(unparsedLogs.map(async log => {
    const topicABI = logTopics[log.topics[0]];
    const logName = topicABI.name;
    const decodedLog = web3.eth.abi.decodeLog(
      topicABI.inputs, log.data, log.topics.slice(1)
    );
    const logValues = Object.assign(...Object.keys(decodedLog)
      .filter(key => topicABI.inputs.map(input => input.name).includes(key))
      .map(key => ({[key]: decodedLog[key]}))
    );

    return { logName, logValues };
  }))

  return parsedLogs;
}

const getAllSmartWallets = async () => {
  console.log("Locating all deployed Dharma Smart Wallet accounts...");
  const SMART_WALLET_FACTORY_ADDRESS = '0xfc00C80b0000007F73004edB00094caD80626d8D';
  const SMART_WALLET_FACTORY_EVENT_ABI = [{"anonymous":false,"inputs":[{"indexed":false,"name":"wallet","type":"address"},{"indexed":false,"name":"userSigningKey","type":"address"}],"name":"SmartWalletDeployed","type":"event"}];
  const SMART_WALLET_FACTORY_DEPLOYMENT = 8575087;

  const smartWalletFactoryLogs = await web3.eth.getPastLogs({
    fromBlock: SMART_WALLET_FACTORY_DEPLOYMENT,
    address: SMART_WALLET_FACTORY_ADDRESS
  });

  const smartWalletFactoryParsedLogs = await getParsedLogs(
    SMART_WALLET_FACTORY_EVENT_ABI, smartWalletFactoryLogs
  );

  return smartWalletFactoryParsedLogs.map(log => log.logValues.wallet);
}

const getAllSmartWalletsWithUniswapInteractions = (wallets) => {
  console.log(`Located ${wallets.length} deployed Dharma Smart Wallet accounts, comparing to proxy account set...`);
  const candidateAccounts = new Set(fs.readFileSync(VALID_ACCOUNTS_FILE, "utf8").split('\n'));
  return wallets.map(wallet => wallet.toLowerCase()).filter(wallet => candidateAccounts.has(wallet));
}

const writeSmartWalletsWithUniswapInteractions = (wallets) => {
  console.log(`Filtered down to ${wallets.length} wallets with Uniswap interactions, writing to 'accounts.txt'...`);
  fs.writeFileSync('accounts.txt', wallets.join('\n'));
  console.log("Done.")
}

const main = async () => {
  const allSmartWallets = await getAllSmartWallets();
  const allSmartWalletsWithUniswapInteractions = getAllSmartWalletsWithUniswapInteractions(allSmartWallets);
  writeSmartWalletsWithUniswapInteractions(allSmartWalletsWithUniswapInteractions);
  process.exit(0);
}

main();
```