# 1inch UNI addresses
In this repository we collected all users who used through 1inch Uniswap and didn't get any UNI rewarded.

We found 4935 unique transaction 1inch tx originators who missed UNI airdrop but used Uniswap internally.

```sql
SELECT 
  DISTINCT from_address
FROM bigquery-public-data.crypto_ethereum.transactions
WHERE hash IN (
  SELECT transaction_hash FROM bigquery-public-data.crypto_ethereum.traces
  WHERE DATE(block_timestamp) < "2020-09-01" AND (SUBSTR(input, 1, 10) = '0x022c0d9f' OR to_address = '0x2157a7894439191e520825fe9399ab8655e0f708')
  INTERSECT DISTINCT
  SELECT transaction_hash FROM bigquery-public-data.crypto_ethereum.traces
  WHERE DATE(block_timestamp) < "2020-09-01" AND to_address IN (
    '0x0000000053d411becdb4a82d8603edc6d8b8b3bc',
    '0x0000000f8ef4be2b7aed6724e893c1b674b9682d',
    '0x111111254b08ceeee8ad6ca827de9952d2a46781',
    '0x0000000006adbd7c01bc0738cdbfc3932600ad63',
    '0x11111254369792b2ca5d084ab5eea397ca8fa48b',
    '0x000005edbbc1f258302add96b5e20d3442e5dd89',
    '0x111112549cfedf7822eb11fbd8fd485d8a10f93f',
    '0xe4c577bdec9ce0f6c54f2f82aed5b1913b71ae2f',

    '0x50fda034c0ce7a8f7efdaebda7aa7ca21cc1267e',
    '0x0a236b41add0073df05eac5fc8505ad745c7859d',
    '0x2ad672fda8a042c4c78c411bf9d4f1b320aa915a',
    '0xc586bef4a0992c495cf22e1aeee4e446cecdee0e',
    '0xdff2aa5689fcbc7f479d8c84ac857563798436dd'
  )
)
```
Uniswap V1 condition: to_address = '0x2157a7894439191e520825fe9399ab8655e0f708'

Uniswap V2 condition: SUBSTR(input, 1, 10) = '0x022c0d9f'
