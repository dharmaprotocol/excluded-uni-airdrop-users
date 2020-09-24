# Project: Nuo Network

This script fetches all the nuo proxy accounts not present in initial uniswap airdrop

###### script

```javascript
require('dotenv').config();
const _ = require('lodash');
const Web3 = require('web3');
const fs = require('fs');
const fetch = require("node-fetch");

const config = 
{
  chunks : 100000,
  nuo :{
    startBlock : 7109332
  },
  uniswap : {
    dropAddrUrl : 'https://mrkl.uniswap.org/',
    cutOffBlock : 10771925 // 1st sept 2020 0:00:02 GMT
  }
}

const addrs =
{
  accountFactory : '0x4e9d7f37eadc6fef64b5f5dccc4deb6224667677',
  uniswapHandler : '0x8108341228820d723C757f0113529999EBE4336d', // dex aggregator
  exchangeSplitter1 : '0x4ad472b021cba28910fe2ff00f3176743e8a9457',
  exchangeSplitter2 : '0x29799f76599515094963794b7ca7ae5840f13a18',
  uniswapConnector : '0x9550050d102ff42a2a683a9fa23b8f3fb2b378c8',
  kernelEscrow : '0xaf38668f4719ecf9452dc0300be3f6c83cbf3721'
}

const abis={accountFactory :[{"constant":true,"inputs":[],"name":"getAllAccounts","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"}],uniswapHandler :[{"anonymous":false,"inputs":[{"indexed":true,"name":"_srcToken","type":"address"},{"indexed":true,"name":"_destToken","type":"address"},{"indexed":false,"name":"_by","type":"address"},{"indexed":false,"name":"_srcAmountSpent","type":"uint256"},{"indexed":false,"name":"_destAmountReceived","type":"uint256"}],"name":"LogExchange","type":"event"}],exchangeSplitter :[{"anonymous":false,"inputs":[{"indexed":true,"name":"orderHash","type":"bytes32"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"srcToken","type":"address"},{"indexed":false,"name":"destToken","type":"address"},{"indexed":false,"name":"byUser","type":"address"},{"indexed":false,"name":"xSplit","type":"address"},{"indexed":false,"name":"srcAmountLeft","type":"uint256"},{"indexed":false,"name":"destAmountReturned","type":"uint256"},{"indexed":false,"name":"fee","type":"uint256"}],"name":"LogOrderCreated","type":"event"}],uniswapConnector :[{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_srcToken","type":"address"},{"indexed":true,"name":"_destToken","type":"address"},{"indexed":false,"name":"_srcTokenValue","type":"uint256"},{"indexed":false,"name":"_maxDestTokenValue","type":"uint256"},{"indexed":false,"name":"_destTokenValue","type":"uint256"},{"indexed":false,"name":"_srcTokenValueLeft","type":"uint256"},{"indexed":false,"name":"_exchangeRate","type":"uint256"}],"name":"LogTrade","type":"event"}],kernelEscrow :[{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"token","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"LogTransferFromAccount","type":"event"}]}


const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`);


var getAccountsFromFactory = async() => {
  let accountFactory = new web3.eth.Contract(abis.accountFactory, addrs.accountFactory);
  let accounts = await accountFactory.methods.getAllAccounts().call();
  return accounts;
}

var getTxsForUniswapHandler = async() => {
  console.log('fetching txns from uniswap handler...' );

  let uniswapHandler = new web3.eth.Contract(abis.uniswapHandler, addrs.uniswapHandler);
  let events = await uniswapHandler.getPastEvents('LogExchange', {
    fromBlock: 0,
    toBlock: config.uniswap.cutOffBlock
  });

  let txns = events.map(
    (event) => { 
      let tx = {
        hash : (event.transactionHash).toLowerCase(),
        event : event
      };

      return tx;
    }
  );
  
  console.log('txns found : ' + txns.length);

  return txns;
}

var getTxsForSplitter = async() => {
  console.log('fetching txns from exchange splitter 1 ...' );

  let exchangeSplitter1 = new web3.eth.Contract(abis.exchangeSplitter, addrs.exchangeSplitter1);
  let events1 = await exchangeSplitter1.getPastEvents('LogOrderCreated', {
    fromBlock: 0,
    toBlock: config.uniswap.cutOffBlock
  });

  let txns1 = events1.map(
    (event) => { 
      let tx = {
        hash : (event.transactionHash).toLowerCase(),
        event : event
      };

      return tx;
    }
  );
  
  console.log('fetching txns from exchange splitter 2 ...' );
  let exchangeSplitter2 = new web3.eth.Contract(abis.exchangeSplitter, addrs.exchangeSplitter2);
  let events2 = await exchangeSplitter2.getPastEvents('LogOrderCreated', {
    fromBlock: 0,
    toBlock: config.uniswap.cutOffBlock
  });

  let txns2 = events2.map(
    (event) => { 
      let tx = {
        hash : (event.transactionHash).toLowerCase(),
        event : event
      };
      return tx;
    }
  );

  let txns = _.concat(txns1,txns2);
  
  console.log('total txns found : ' + txns.length);
  return txns;
} 

var getAccountsForSplit = async() => {
  console.log('fetching accounts for dex aggregator...' );
  let txns1 = await getTxsForUniswapHandler();
  let txns2 = await getTxsForSplitter();

  console.log('matching txns...' );
  let txns = _.intersection(
    txns1.map(txn => txn.hash),
    txns2.map(txn => txn.hash)
  );
  
  console.log('common found : ' + txns.length );
  console.log('few txns to check...' );
  console.log(txns.slice(0,5));

  let accs = [];

  txns2.forEach(
    (tx) => {
      if(txns.includes(tx.hash)) {
        acc = (tx.event.returnValues['account']).toLowerCase();
        accs.push(acc);
      }
    }
  )
  
  accs = _.uniq(accs);

  console.log('unique accounts found : ' + accs.length);

  return accs;
}

var getTxsForUniswapConnector = async() => {
  console.log('fetching txns from uniswap connector...' );

  let uniswapConnector = new web3.eth.Contract(abis.uniswapConnector, addrs.uniswapConnector);
  let events = await uniswapConnector.getPastEvents('LogTrade', {
    fromBlock: 0,
    toBlock: config.uniswap.cutOffBlock
  });

  let txns = events.map(
    (event) => { 
      let tx = {
        hash : (event.transactionHash).toLowerCase(),
        event : event
      };

      return tx;
    }
  );

  console.log('txns found : ' + txns.length);

  return txns;
}

var getTxsFromEscrow = async() => {
  console.log('fetching txns from kernel escrow...' );

  let kernelEscrow = new web3.eth.Contract(abis.kernelEscrow, addrs.kernelEscrow);

  let txns1 = [];

  //work around for -> Error: Returned error: query returned more than 10000 results
  for (i = config.nuo.startBlock; i < config.uniswap.cutOffBlock; i+=config.chunks) {
    let options;
    if( i+config.chunks > config.uniswap.cutOffBlock) {
      options = {
        fromBlock: i,
        toBlock: config.uniswap.cutOffBlock
      }
    } else {
      options = {
        fromBlock: i,
        toBlock: i+config.chunks
      }
    }

    let events1 = await kernelEscrow.getPastEvents('LogTransferFromAccount', options);
  
    let txns = events1.map(
      (event) => { 
        let txn = {
          hash : (event.transactionHash).toLowerCase(),
          account : (event.returnValues['account']).toLowerCase()
        };
  
        return txn;
      }
    );
    
    txns1 = _.concat(txns,txns1);
  }

  let txns2 = [];
  let allAccounts = await getAccountsFromFactory();
  allAccounts = allAccounts.map(acc => acc.toLowerCase());
  
  //work around for -> Error: Returned error: query returned more than 10000 results
  for (i = config.nuo.startBlock; i < config.uniswap.cutOffBlock; i+=config.chunks) {
      let options;
      if( i+config.chunks > config.uniswap.cutOffBlock) {
        options = {
          fromBlock: i,
          toBlock: config.uniswap.cutOffBlock
        }
      } else {
        options = {
          fromBlock: i,
          toBlock: i+config.chunks
        }
      }

      let events2 = (await kernelEscrow.getPastEvents('LogTransfer', options));

      let txns = events2.map(
        (event) => { 
          let tx = {
            hash : (event.transactionHash).toLowerCase(),
            event : event
          };

          return tx;
        }
      );
    
      txns = txns.filter(
        (txn) => {
          return allAccounts.includes((txn.event.returnValues['to']).toLowerCase());
        }
      )

      txns = txns.map (
        (txn) => { 
          let tx = {
            hash : txn.hash,
            account : (txn.event.returnValues['to']).toLowerCase()
          };
          return tx;
        }
      );

      txns2 = _.concat(txns,txns2);
    }

  let txns = _.concat(txns1,txns2);

  console.log('total txns found : ' + txns.length);

  return txns;
}

var getAccountsForMargin = async() => {
  console.log('fetching accounts for margin trading...' );
  let txns1 = await getTxsForUniswapConnector();
  let txns2 = await getTxsFromEscrow();

  console.log('matching txns...' );
  let txns = _.intersection(
    txns1.map(txn => txn.hash),
    txns2.map(txn => txn.hash)
  );
  
  console.log('common found : ' + txns.length );
  console.log('few txns to check...' );
  console.log(txns.slice(0,10));

  let accs = [];
  
  txns2.forEach(
    (tx) => {
      if(txns.includes(tx.hash)) {
        accs.push(tx.account);
      }
    }
  )
  
  accs = _.uniq(accs);
  console.log('unique accounts found : ' + accs.length);

  return accs;
}


//shout out to opyn code, thanks for this function
var getUniswapDropAddr = async () => {
  console.log('getting uniswap airdrop addresses...');
    
  let uri = config.uniswap.dropAddrUrl;
  res = await fetch(uri);
  
  const uniAdresses = await res.json();
  const claims = uniAdresses['claims'];
  var addresses = Object.keys(claims);

  console.log('addresses found : ' + addresses.length);
  return addresses;
}

var writeToFile = (accounts) => {
  console.log('writing to file...');
  fs.writeFileSync('accounts.txt', accounts.join('\n'));
}



var main = async () => {
  console.log('starting computation...');
  
  console.log('fetching nuo details...');
  console.log('---------------------------');
  let accs1 = await getAccountsForSplit(); // dex aggregator
  console.log('---------------------------');
  let accs2 = await getAccountsForMargin(); // margin trading
  console.log('---------------------------');
  let accs = _.concat(accs1, accs2);
  let nuoAccs = _.uniq(accs);

  console.log('total nuo accounts found with uniswap interactions : ' + nuoAccs.length);

  console.log('---------------------------');

  console.log('fetching uniswap drop details...');
  
  let uniswapAccs = await getUniswapDropAddr();  

  console.log('uniswap airdrop addresses found : ' + uniswapAccs.length);

  console.log('---------------------------');

  console.log('excluding nuo addresses from uniswap airdrop ones...');

  let nuoWithoutAirdrop = [];

  nuoAccs.forEach( nuoAcc => {
    if ( !uniswapAccs.includes(nuoAcc) ) {
      nuoWithoutAirdrop.push(nuoAcc)
    }
  });

  console.log('total nuo accounts without uniswap airdrop : ' + nuoWithoutAirdrop.length);
  console.log('---------------------------');

  writeToFile(nuoAccs);

  console.log('complete!!!');
}



main();
```

###### console output

```shell

starting computation...
fetching nuo details...
---------------------------
fetching accounts for dex aggregator...
fetching txns from uniswap handler...
txns found : 317
fetching txns from exchange splitter 1 ...
fetching txns from exchange splitter 2 ...
total txns found : 834
matching txns...
common found : 317
few txns to check...
[ '0x44cb2a6c968d7ef012db232400cc97a222d1c68383abdd5b502e537bb6b6bc82',
  '0x860b04753f50571273140327f96fff0c271a5c3d09a75a9ebd23f480b2d182bb',
  '0x2230a74240e242f64781334dcb3c6b254e75a3f026b2dbde5b4e3a39a6d33ff3',
  '0xfd2d970e8cc4a3fad5e5919e8d845c5bd110934f040f226a1895e41cb62b5d08',
  '0xba3f1ef63e4a271b1f807a67bacf21b881c54833b01e73cc028cde809d477aab' ]
unique accounts found : 142
---------------------------
fetching accounts for margin trading...
fetching txns from uniswap connector...
txns found : 9849
fetching txns from kernel escrow...
total txns found : 51877
matching txns...
common found : 7666
few txns to check...
[ '0x7bf4595ed1af2dcb024dc22e881553ec97e6280752c2fff142c0d01fa8c994f4',
  '0xb08232e7edca024613ecc608622b997d8574510dbfd73d4fc09e576549c8a3ca',
  '0x11be9fa81113160c1c115650225e3083ade2c4ee4f16a031fa6b87e2a0c124cb',
  '0x0b58a97dc55695b1b85e911657fc397a5e6e23e94c65e7132bbc160b649fd09f',
  '0x389684b835d59e79eaf49d7a52f3ac2a3e6307179dc3cabee738afc6ac6f46f5',
  '0xf9e982ffef6f6dfe65fc35304fd0bdc790da9b9aee2f79ed12bd079835c7eb17',
  '0xc14751a970d1d150f3dfd8bc0fd65af7de0cb95492539edd07675961ec8de4c1',
  '0x82b093b5da50a78879616e2cccbf635ff45ef213e0024354dbb2fde51dc4a06a',
  '0x61192a63b1058eabb010d2967763c2b7e9cb79588d1c270d4b2faf17f97ed0e9',
  '0x48d556bbb7c6ad04bcbc0f1e970eb5a909c6ab414b45d4ea53ef4187a053ee08' ]
unique accounts found : 646
---------------------------
total nuo accounts found with uniswap interactions : 740
---------------------------
fetching uniswap drop details...
getting uniswap airdrop addresses...
addresses found : 252803
uniswap airdrop addresses found : 252803
---------------------------
excluding nuo addresses from uniswap airdrop ones...
total nuo accounts without uniswap airdrop : 740
---------------------------
writing to file...
complete!!!

```