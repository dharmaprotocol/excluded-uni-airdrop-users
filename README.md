# Retroactive $UNI Airdrop — Excluded  User Set

# Context
- [Retroactive Airdrop Excludes Proxy Contract Users](https://gov.uniswap.org/t/retroactive-airdrop-excludes-proxy-contract-users-e-g-dharma-matcha-etc/)
- [Application For Retroactive Proxy Contract Users](https://gov.uniswap.org/t/application-for-retroactive-proxy-contract-airdrop-for-projects-apps/3221)
- [Revised Retroactive Query repo](https://github.com/dharma-eng/retroactive-query)

#  Overview

This repo is meant to serve as a hub for projects to submit their sets of affected user addresses in a standardized format.  The repo contains some basic programmatic sanity checks to validate that:

1. The submitted addresses were **not** in the initial UNI airdrop (including SOCKS drops)
2. The submitted addresses **are** in the set of addresses affected by the proxy contract omission

# Submission Instructions
1. Submit a PR to this repo creating a new directory for your project in the projects folder, e.g. `projects/Dharma`
2. Your project's directory should contain two files: `accounts.txt` and `README.md`
3. `accounts.txt` should a text file containing your list of affected users' accounts, in the form of one valid Ethereum address per line

4. `README.md` should contain basic instructions on how to pull the set of addresses submitted.  If a script is required, it should be included in the readme in some capacity.

# How To Test that Your Accounts Are Valid
```bash
> yarn
> yarn test
```
