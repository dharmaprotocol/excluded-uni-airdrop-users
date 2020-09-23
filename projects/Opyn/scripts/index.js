var argv = require('minimist')(process.argv.slice(2));

const utils = require('./utils');
const registry = require('./registry');
const getInteractedAddressesWithUniswap = require('./getInteractedAddressesWithUniswap');

// run
async function runKpi() {
    // opyn tokens array
    let oTokens = [];
    let oethTokens = [];

    // get factory instance
    let factoryInstance1 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[0]);  // ocDai,ocUsdc,Ocrv factory
    let factoryInstance2 = await utils.initContract(utils.OptionsFactoryAbi, registry.factory[1]);  // oEth factory

    // get number of oTokens
    let oTokenCounter = await factoryInstance1.methods.getNumberOfOptionsContracts().call();    // ocDai,ocUsdc,oCrv
    let oethTokensCounter = await factoryInstance2.methods.getNumberOfOptionsContracts().call();    // oEth 

    // get tokens instances
    for (let i=0; i<oTokenCounter; i++) {
        oTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance1.methods.optionsContracts(i).call()
            )
        ); 
    }
    for (let i=0; i<oethTokensCounter; i++) {
        oethTokens.push(
            await utils.initContract(
                utils.OptionsContractAbi,
                await factoryInstance2.methods.optionsContracts(i).call()
            )
        );
    }

    switch(argv.m) {
        case 'interacted-addresses-with-uniswap':
            getInteractedAddressesWithUniswap.run(oTokens.concat(oethTokens));
            break;
        default:
            await getInteractedAddressesWithUniswap.run(oTokens.concat(oethTokens));
    }      
}

runKpi();