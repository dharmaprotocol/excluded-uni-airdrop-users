# Eidoo Excluded Addresses From Uni Airdrop

## Install dependencies

    npm i

## Generate accounts.txt

In order to generate the accounts.txt file you have to run the following command, please specify a valid ethereum rpc url in place of `http://localhost:8545`

    node ./export-contract-callers.js --from-block 9288213 --to-block 10778455 --target eidoo-uniswap-contracts.json --signature '0x5e75228f' -e http://localhost:8545
    
