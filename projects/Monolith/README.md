Monolith
--------

Monolith integrated with ParaSwap to provide swaps to users of the Monolith
smart-contract wallet.

Having reviewed the list of accounts submitted by ParaSwap against our own
data, it appears that some of our users have been missed off the list for
reasons we aren't quite sure of.

We scanned through the transactions of all Monolith wallets known to have
performed an in-app swap prior to 1st September 2020 and filtered those who
swapped through Uniswap using the `scan_uni_transactions.py` script attached.
We then cross referenced both the wallet (smart-contract) address and EOA
address for each user who swapped through Uniswap against the list submitted
by ParaSwap using the `check_paraswap.py` script and found 19 missing users.
Their wallet addresses have been added to the `accounts.txt` list in this PR.

A list containing the EOA account address as well as example transaction
hashes that were routed through Uniswap is also provided in
`paraswap_excluded.csv`.
