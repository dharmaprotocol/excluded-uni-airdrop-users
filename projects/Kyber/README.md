# Fetching Addresses

Run this [DuneAnalytics query](https://explore.duneanalytics.com/queries/10167/source). If you have a Dune Pro account, you will be able to export the result as CSV and convert it to `UniswapRetroactive_DuneAnalyticsEligibleKyberAddresses.json`. Otherwise, the extraction will have to be manually performed aka using the CTRL/CMD, C and V keys.

Unfortunately, this query only fetches all trading addresses that used Kyber's v1 proxy contract (`0x818e6fecd516ecc3849daf6845e3ec868087b755`). Hence, a script to supplement this query was written, which can be found in `./script/getKyberUniswapRetroactive.js`.

Note that the script was executed with a local node.

The script does the following:
    1) fetches all addresses that have traded with the UniswapV1 and UniswapV2 bridge reserves
    2) combines with the dune analytics query and filters through the addresses that were part of the initial airdrop. The full merkle tree was downloaded by running `curl https://ipfs.io/ipfs/Qmegj6pV3qvGE8XWfMPdzXCu2sUoNMGtpbL5vYuAkhnJja > merkleAddresses.json`
