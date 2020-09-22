const { users: initialUNIAllocation } = require("./initial-UNI-allocation/users.json")
const { users: maxValidUserSet  } = require("./all-addresses-in-uniswap-transactions/users.json");

const { users: dharma } = require("./dharma/users.json");

const totalUserSet = dharma;

it("should not have overlap with the initial UNI allocation", () => {
    const intersection = totalUserSet.filter(x => initialUNIAllocation.includes(x));

    expect(intersection.length).toBe(0);
});

it("should only have addresses that interacted with Uniswap contracts at any given time", () => {
    const difference = totalUserSet.filter(x => !maxValidUserSet.includes(x));

    expect(difference.length).toBe(0);
});
