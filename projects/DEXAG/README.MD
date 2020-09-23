# DEXAG

## Links

- [Project Site](https://dex.ag)
- [Script Repo](https://github.com/nedodn/DEXAG_UNI_ADDRESSES)
- [Script to pull Addresses](https://github.com/nedodn/DEXAG_UNI_ADDRESSES/blob/master/getUniAddresses.js)

## Explainer

To generate the list of excluded users for DEXAG, we pulled a list of all transactions that were sent to one of our contracts from the ETHVM team's SQL db of transactions. The query is structureds as follows:


```
SELECT "hash",
        "block",
        "from",
        "to",
        "data"
FROM 
    (SELECT number AS block,
         tx."from" AS "from",
         tx."to" AS "to",
         tx.hash AS hash,
         tx.input AS data
    FROM mainnet.ethereum_blocks
    CROSS JOIN UNNEST(mainnet.ethereum_blocks.transactions) AS txs(tx)
    WHERE range>=8600000
            AND (tx."to"='0x745daa146934b27e3f0b6bff1a6e36b9b90fb131'
            OR tx."to"='0xa540fb50288cc31639305b1675c70763c334953b'
            OR tx."to"='0x932348df588923ba3f1fd50593b22c4e2a287919'))
```

The result from this query is stored in `txs.csv`

We also pull `Trade` events from our contracts which are emitted on succesful swaps, this is to include transactions that were submitted via a contract, such as an Authereum wallet

From this list, we filter out all transactions that did not involve Uniswap or were submitted after the Snapshot Date and compare the remaining user list with the `claims` array from https://mrkl.uniswap.org.
We prune the users who have already claimed their UNI and the remaining addresses are all users who were excluded from the initial UNI airdrop.
