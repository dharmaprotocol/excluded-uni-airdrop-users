// Libraries
const fs = require('fs');
const { exec } = require("child_process");
const zlib = require('zlib');

describe("Projects", () => {
    let validAccounts;

    beforeAll(async () => {
        const gzippedAccountsFile = "./data/all-addresses-in-uniswap-transactions/candidate_UNI_proxy_airdrop_accounts.txt.gz";
        const accountsFile = "./data/temp/valid-accounts.txt";

        const fileContents = fs.createReadStream(gzippedAccountsFile);
        const writeStream = fs.createWriteStream(accountsFile);
        const unzip = zlib.createGunzip();

        fileContents.pipe(unzip).pipe(writeStream);
    });

    describe("Dharma", () => {
        let accounts;

        it("every submitted address is in the list of valid addresses", async () => {
            // TODO Compare each line in project with valid-accounts.txt.
        });
    });
});
