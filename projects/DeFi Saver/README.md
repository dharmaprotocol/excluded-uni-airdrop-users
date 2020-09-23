# Retroactive $UNI Airdrop — Excluded DeFi Saver User Set

# Context
- [Our initial post in the Retroactive Airdrop Excludes Proxy Contract Users discussion thread](https://gov.uniswap.org/t/application-for-retroactive-proxy-contract-airdrop-for-projects-apps/3221/5)
- [Our follow-up post in the Retroactive Airdrop Excludes Proxy Contract Users discussion thread](https://gov.uniswap.org/t/retroactive-airdrop-excludes-proxy-contract-users-e-g-dharma-matcha-etc/1222/214)
- [Our application in the Application For Retroactive Proxy Contract Users thread](https://gov.uniswap.org/t/application-for-retroactive-proxy-contract-airdrop-for-projects-apps/3221/5)

#  Overview

The accounts.txt file contains all the accounts omitted from the initial UNI aidrop because their swaps were being made via DeFi Saver proxy (wrapper) contracts.

The four UniswaperWrapper contracts that were in use at DeFi Saver up to September 1st 2020 are:
- 0x1E30124FDE14533231216D95F7798CD0061E5CF8
- 0x0AA70981311D60A9521C99CECFDD68C3E5A83B83
- 0x880A845A85F843A5C67DB2061623C6FC3BB4C511
- 0xFF92ADA50CDC8009686867B4A470C8769BEDB22D

As mentioned in our follow-up post in the discussion thread mentioned above, we are submitting a list of user account owned DSProxy accounts.

In case of DeFi Saver the chain of accounts and contracts within a transaction goes as follows: TxSender > User DSProxy > UniswapWrapper > Uniswap.

The TxSender account can be either User Account or Automation Bot Account (of which we have at least 10 currently active and more that were used previously).

In order for the UNI airdrop to reach the actual accounts that were swapping funds via Uniswap (and not our Automation bot accounts that were merely calling transactions based on user configured triggers or any of our smart contracts) we have submitted a list of all user owned DSProxy accounts whose funds were swapped via Uniswap via any one of our UniswapWrapper contracts listed above. This is in a way similar to what Dharma does with signing transactions for their users and as much as 70% of all DeFi Saver transactions that involve swaps have been sent out by Automation in August, for example.

Additional argument in support of this decision is that the DSProxy accounts are actually the ones that hold the funds that are being swapped via Uniswap in each of the trades made using DeFi Saver. Specifically, those would be funds within MakerDAO CDPs/Vaults or within Compound portfolios. They are also the closest to actual Uniswap contracts within the transaction chain of accounts and contracts. We believe both of these arguments are in line with the idea and concept of the original UNI airdrop, though we are of course open to discussion.

We should also note that we already have an interface available from withdrawing any tokens (including UNI) from user owned DSProxies. And users can of course claim the UNI using Uniswap's interface prior to that.

We have filtered out any smart contract addresses and addresses that already received the original UNI airdrop.


# Query script

The query script was forked from the original https://github.com/Uniswap/retroactive-query as suggested in the application thread and adapted to query all user owned DSProxy accounts that interacted with Uniswap via DeFi Saver UniswapWrapper contracts.

[DeFi Saver Uniswap Retroactive Query](https://github.com/nklipa13/retroactive-query)
