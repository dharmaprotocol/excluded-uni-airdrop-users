# Project: MEW (MyEtherWallet)

script is available at https://github.com/MyEtherWallet/DEXAG_UNI_ADDRESSES

we used the following sql query against the internal ethvm data we have to get the list of transactions went to our proxy contracts

```sql
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
    WHERE range>=9800000
            AND (tx."to"='0xb76c291871b92a7c9e020b2511a3402a3bf0499d'
            OR tx."to"='0xba30a255a23fc6e864f1195eaccedf1eeac9a64c'
            OR tx."to"='0x01e176828454368f60898f04025dce3bcfe76ab5'))
```
