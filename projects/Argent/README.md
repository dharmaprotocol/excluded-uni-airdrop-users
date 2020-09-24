# Fetching Addresses

Run this Dune Analytics query and filter through the addresses that were part of the initial airdrop

```
with tx_hashes as (
    select hash, block_number, substring(data for 20 from 245) as wallet
    from ethereum.transactions
    where "from" in ('\xdd5a1c148ca114af2f4ebc639ce21fed4730a608', '\x0385b3f162a0e001b60ecb84d3cb06199d78f666', '\xf27696c8bca7d54d696189085ae1283f59342fa6') -- argent relayers
    where "to" in ('\xed0DA07AAB7257Df53Efc4DfC076745744138Ed9') -- argent TokenExchanger module
    and block_number >= 7173673 -- module creation block
    and block_number < 10771925 -- 2020, Sept 1
), kyber_uniswap_routers(address) as (VALUES
    ('\x13032deb2d37556cf49301f713e9d7e1d1a8b169'), -- uniV1, bridge v1,
    ('\x5d154c145db2ca90b8ab5e8fe3e716afa4ab7ff0'), -- uniV1, bridge v2
    ('\x54a4a1167b004b004520c605e3f01906f683413d'), -- uniV1, bridge v3
    ('\x31e085afd48a1d6e51cc193153d625e8f0514c7f'), -- uniV1. bridge v4
    ('\x80827ce0d1b23ac2f30b4244d27b0aa904bda83c'), -- univ2, bridge v1
    ('\x10908c875d865c66f271f5d3949848971c9595c9')  -- univ2, bridge v2
)
select distinct concat('0x', right(wallet::text, 40)) as wallet
from ethereum.traces
join tx_hashes
on traces.tx_hash = tx_hashes.hash and traces.block_number = tx_hashes.block_number
and (
    "from" in (select address::bytea from kyber_uniswap_routers)
 or "to" in (select address::bytea from kyber_uniswap_routers))
and value > 0
order by 1;
```