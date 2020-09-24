#!/usr/bin/env node

const fs = require('fs');
const Web3 = require('web3');

const rpcUrl = 'http://localhost:8545'; // local OpenEthereum node
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

process.on('unhandledRejection', console.error.bind(console));

Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
};

async function katalystBridges() {
  // Include Uniswap bridge data on Katalyst proxy,
  // in which the data is not available in Dune Analytics
  const katalyst = '0x7C66550C9c730B6fdd4C03bc2e73c5462c5F7ACC';
  const uniswapV1Address = '0x31e085afd48a1d6e51cc193153d625e8f0514c7f';
  const uniswapV1ABI = JSON.parse(fs.readFileSync('./abi/KyberUniswapReserveV1.abi', 'utf8'));
  const uniswapV1 = new web3.eth.Contract(uniswapV1ABI, uniswapV1Address);
  const uniswapV2Address = '0x10908c875d865c66f271f5d3949848971c9595c9';
  const uniswapV2ABI = JSON.parse(fs.readFileSync('./abi/KyberUniswapReserveV2.abi', 'utf8'));
  const uniswapV2 = new web3.eth.Contract(uniswapV2ABI, uniswapV2Address);
  const katalystBridgesSave = 'UniswapRetroactive_KatalystUniswapBridges.json';

  const uniswapV1Events = await uniswapV1.getPastEvents('TradeExecute', {
    fromBlock: 	10406938,
    toBlock: 10771924
  });
  const uniswapV2Events = await uniswapV2.getPastEvents('TradeExecute', {
    fromBlock: 	10406938,
    toBlock: 10771924
  });
  const uniswapV1FilteredEvents = uniswapV1Events.filter(o => o.returnValues.sender === katalyst);
  const uniswapV2FilteredEvents = uniswapV2Events.filter(o => o.returnValues.sender === katalyst);
  const uniswapV1txHashes = uniswapV1FilteredEvents.map(o => o.transactionHash);
  const uniswapV2txHashes = uniswapV2FilteredEvents.map(o => o.transactionHash);

  const uniswapV1Addresses = [];
  for (let i = 0; i < uniswapV1txHashes.length; i++) {
    let address = (await web3.eth.getTransaction(uniswapV1txHashes[i])).from;
    if (!uniswapV1Addresses.includes(address)) uniswapV1Addresses.push(address);
  }
  const uniswapV2Addresses = [];
  for (let i = 0; i < uniswapV2txHashes.length; i++) {
    let address = (await web3.eth.getTransaction(uniswapV2txHashes[i])).from;
    if (!uniswapV2Addresses.includes(address)) uniswapV2Addresses.push(address);
  }

  let output = uniswapV1Addresses.concat(uniswapV2Addresses).unique();
  output = { addresses: output };

  fs.writeFileSync(katalystBridgesSave, JSON.stringify(output), function(err) {
    if (err) {
      console.log(err);
    }
  });
}

async function getFinalOutput() {
  let duneAddresses = (JSON.parse(fs.readFileSync('./UniswapRetroactive_DuneAnalyticsEligibleKyberAddresses.json', 'utf8'))).addresses;
  let bridgeAddresses = (JSON.parse(fs.readFileSync('./UniswapRetroactive_KatalystUniswapBridges.json', 'utf8'))).addresses;
  const ineligibleUsers = (JSON.parse(fs.readFileSync('./merkleAddresses.json', 'utf8'))).claims;
  duneAddresses = duneAddresses.map(address => address.toLowerCase());
  bridgeAddresses = bridgeAddresses.map(address => address.toLowerCase());

  const kyberCombined = duneAddresses.concat(bridgeAddresses).unique();
  const saveFile = 'accounts.txt';

  let output = filterUsers(kyberCombined, ineligibleUsers);
  output = output.join('\n');

  fs.writeFileSync(saveFile, JSON.stringify(output), function(err) {
    if (err) {
      console.log(err);
    }
  });
}

function filterUsers(kyberCombined, ineligibleUsers) {
  let result = [];
  for (let address of kyberCombined) {
    address = web3.toChecksumAddress(address);
    if (ineligibleUsers[address] == undefined) {
      result.push(address);
    }
  }
  return address;
}

// Start the script
katalystBridges();
getFinalOutput();
