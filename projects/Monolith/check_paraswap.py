"""Check which of our users were included in the paraswap list."""

import csv

INPUT_FILE = "included.csv"
PARASWAP_INCLUDED = "paraswap.txt"
OUTPUT_FILE = "paraswap_excluded.csv"


def main():
    paraswap_accs = load_paraswap()
    para_excluded = []

    with open(INPUT_FILE) as f:
        reader = csv.reader(f)
        assert len(next(reader)) == 4

        for _, wallet_address, eoa_address, trans_hash in reader:
            if (
                wallet_address.lower() not in paraswap_accs
                and eoa_address.lower() not in paraswap_accs
            ):
                para_excluded.append((wallet_address, eoa_address, trans_hash))

    if para_excluded:
        with open(OUTPUT_FILE, "w") as f:
            writer = csv.writer(f)
            writer.writerow(["wallet_address", "eoa_address", "transaction_hash"])
            writer.writerows(para_excluded)
        print(f"wrote excluded users to {OUTPUT_FILE}")
    else:
        print("all users present and accounted for")


def load_paraswap():
    with open(PARASWAP_INCLUDED) as f:
        return set(l.strip().lower() for l in f.readlines())


if __name__ == "__main__":
    main()
