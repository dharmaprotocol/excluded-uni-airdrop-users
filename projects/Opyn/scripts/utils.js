// Import modules
require('dotenv').config()
const Web3 = require('web3');

// connect to Infura
const rpcUrl = process.env.INFURA_ENDPOINT || '';
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// init contract object
exports.initContract = async (abi, address) => {
    return new web3.eth.Contract(abi, address);
}

exports.toHex = (string) => {
    return web3.utils.toHex(string);
}

// Import ABIs
exports.OptionsFactoryAbi = require('./ABI/OptionsFactory.json');
exports.OptionsContractAbi = require('./ABI/OptionsContract.json')
exports.UniswapFactoryAbi = require('./ABI/UniswapFactory.json')
exports.UniswapExchangeAbi = require('./ABI/UniswapExchange.json')