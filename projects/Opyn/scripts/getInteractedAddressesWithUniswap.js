// Import modules
const utils = require('./utils');
const registry = require('./registry');
const fetch = require("node-fetch");

// get list of unique addresses that interacted with a specific oToken (sent or received an oToken)
// to get the number of addresses => addresses.length
exports.run = async (tokens) => {
    let uniswapFactoryInstance = await utils.initContract(utils.UniswapFactoryAbi, registry.uniswapFactory);  // uniswap factory
    let totalAddresses = [];

    for (let j = 0; j < tokens.length; j++) {
        let addresses = []; // interacted addresses for each oToken
        let otokenName = await tokens[j].methods.name().call(); // oToken name
        let otokenAddress = await tokens[j]._address; // oToken address
        
        // ignore oToken without name
        if (utils.toHex(otokenName) == 0x0) {
            continue;
        }
        let tokenUniswapExchange = await uniswapFactoryInstance.methods.getExchange(tokens[j]._address).call(); // oToken uniswap exchange address

        // get all past Transfer events
        // before block 10771925 2020-09-01 0:00:02 GMT https://etherscan.io/block/10771925
        let transferEvent = await tokens[j].getPastEvents('Transfer', {
            fromBlock: 0,
            toBlock: 10771925
        });

        // loop through events & remove deplicated one + mint events + otoken addresses
        for (let i = 0; i < transferEvent.length; i++) {
            if (
                (transferEvent[i].returnValues.from != tokenUniswapExchange)
                && (transferEvent[i].returnValues.from != "0x0000000000000000000000000000000000000000")
                && (!addresses.includes(transferEvent[i].returnValues.from))
                && (transferEvent[i].returnValues.from != otokenAddress )
            ) {
                addresses.push(transferEvent[i].returnValues.from);
                if (!totalAddresses.includes(transferEvent[i].returnValues.from)) totalAddresses.push(transferEvent[i].returnValues.from);
            }
            if (
                (transferEvent[i].returnValues.to != tokenUniswapExchange)
                && (transferEvent[i].returnValues.to != "0x0000000000000000000000000000000000000000")
                && (!addresses.includes(transferEvent[i].returnValues.to))
                && (transferEvent[i].returnValues.to != otokenAddress)
            ) {
                addresses.push(transferEvent[i].returnValues.to);
                if (!totalAddresses.includes(transferEvent[i].returnValues.to)) totalAddresses.push(transferEvent[i].returnValues.to);
            }
        }
    }

    let uniswapAddresses = await getUniAddressesWithAirdrops()

    let opynAddressesWithoutAirdrop = []

    totalAddresses.forEach( opynAddress => {
        if ( !uniswapAddresses.includes(opynAddress) ) {
            opynAddressesWithoutAirdrop.push(opynAddress)
        }
    });

    // log all the addresses without Airdrop
    console.dir(opynAddressesWithoutAirdrop, { 'maxArrayLength': null });

    // log the total number of addresses
    console.log("total Opyn addresses without Uni Airdrop", opynAddressesWithoutAirdrop.length)
}

// get all the addresses that received airdrop from Uniswap
getUniAddressesWithAirdrops = async () => {
    let uri = "https://mrkl.uniswap.org/"
    res = await fetch(uri)
    const uniAdresses = await res.json()
    const claims = uniAdresses['claims']

    var addresses = Object.keys(claims);

    return addresses

}