# Retroactive $UNI Airdrop — Excluded  User Set

# Context
- [Retroactive Airdrop Excludes Proxy Contract Users](https://gov.uniswap.org/t/retroactive-airdrop-excludes-proxy-contract-users-e-g-dharma-matcha-etc/)
- [Application For Retroactive Proxy Contract Users](https://gov.uniswap.org/t/application-for-retroactive-proxy-contract-airdrop-for-projects-apps/3221)

#  Overview

This repo is meant to serve as a hub for projects to submit their sets of affected user addresses in a standardized format.  The repo contains some basic programmatic sanity checks to validate that:

1. The submitted addresses were **not** in the initial UNI aidrdop
2. The submitted addresses **are** in the set of addresses affected by the proxy contract  omission

# Submission Instructions
1. Submit a PR to this repo creating a new directory named `<project-name>`
2. The directory should contain two files: `users.json` and `README.md`
3. `users.json` should be a JSON file containing your list of affected users in the following format:

```JSON
{
    "users": [
        "<ethAddress1>",
        "...",
        "<ethAddressN>"
    ]
}
```
4. `README.md` should contain basic instructions on how to pull the set of addresses submitted.  If a script is required, it should be included in the directory in some capacity.
5. Update `test.js` to pull from your user list in validating the above invariants.

# How To Sanity Check
```bash
> yarn
> yarn test
```
