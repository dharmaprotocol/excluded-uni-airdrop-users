# Opyn Excluded Addresses From Uni Airdrop

## Instructions

### Go to the scripts directory
```
$ cd scripts
```

### Install dependencies:
```
$ npm i
```


### Configure

Create an **.env** file with the Infura Key 
```
INFURA_KEY="YOUR_KEY"
```

### Run the script

This script will return unique addresses that interacted with all oTokens (sent or received any oToken) before Sep-01-2020 12:00:02 AM +UTC and did not receive Uni from Airdrops

```bash
$ node index.js -m interacted-addresses
```
