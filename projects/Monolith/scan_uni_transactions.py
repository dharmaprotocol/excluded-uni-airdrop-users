#!/usr/bin/env python3
"""Analyse swap transactions using etherscan API"""
import csv
import pprint
import os
import time
from concurrent import futures
from typing import List, Any, Optional, Tuple, Iterable, Callable, Iterator, Dict

import requests

API_KEY = os.environ["ETHERSCAN_API_KEY"]


class EthAddress:
    def __init__(self, hex_address: str):
        self._hex = hex_address

    def __eq__(self, other: Any) -> bool:
        return self._hex.lower() == str(other).lower()

    def __str__(self):
        return self._hex


UNISWAP_ADDRESS = EthAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
SWAP_USERS_FILE = "unique_swap_users.csv"
EXCLUDED_FILE = "excluded.csv"
INCLUDED_FILE = "included.csv"
NUM_THREADS = 2


def main():
    with open(SWAP_USERS_FILE) as f:
        included, excluded = process_swap_users(csv.reader(f))

    with open(INCLUDED_FILE, "w") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["user_id", "wallet_address", "EOA address", "uniswap_transaction"]
        )
        writer.writerows(included)
    print(f"written inlcuded users to file: {INCLUDED_FILE}")

    with open(EXCLUDED_FILE, "w") as f:
        writer = csv.writer(f)
        writer.writerow(["user_id", "wallet_address"])
        writer.writerows(excluded)
    print(f"written excluded users to file: {EXCLUDED_FILE}")


def process_swap_users(
    reader: Iterator[List[str]],
) -> Tuple[List[Tuple[str, str, str, str]], List[Tuple[str, str]]]:
    executor = futures.ThreadPoolExecutor(max_workers=NUM_THREADS)
    next(reader)
    future_results = [
        (user_id, wallet_address, executor.submit(find_uni_trans, wallet_address))
        for user_id, wallet_address in reader
    ]
    uniswap_transactions = (
        (user_id, wallet_address, future.result())
        for (user_id, wallet_address, future) in future_results
    )
    return collect_transactions(uniswap_transactions)


def collect_transactions(
    uni_transactions: Iterable[Tuple[str, str, Optional[str]]],
) -> Tuple[List[Tuple[str, str, str, str]], List[Tuple[str, str]]]:
    included, excluded = [], []
    for user_id, wallet_address, trans_hash in uni_transactions:
        if trans_hash:
            eoa_addr = get_eoa(trans_hash)
            included.append((user_id, wallet_address, eoa_addr, trans_hash))
        else:
            excluded.append((user_id, wallet_address))

    return included, excluded


def find_uni_trans(wallet_address: EthAddress) -> Optional[str]:
    transactions = get_transactions(wallet_address)
    for trans in transactions:
        internal_transactions = get_internal_transactions(trans["hash"])
        for internal_trans in internal_transactions:
            if (
                EthAddress(internal_trans["from"]) == UNISWAP_ADDRESS
                or EthAddress(internal_trans["to"]) == UNISWAP_ADDRESS
            ):
                return trans["hash"]

    return None


def get_transactions(wallet_address: EthAddress) -> List[Dict[str, Any]]:
    print(f"getting transactions for address {wallet_address}")
    resp = requests.get(
        f"https://api.etherscan.io/api?module=account&action=txlistinternal&address={wallet_address}&startblock=0&endblock=99999999&sort=asc&apikey={API_KEY}"
    )
    resp.raise_for_status()
    body = resp.json()

    if rate_limited(body):
        print("got rate limited, waiting to retry...")
        time.sleep(1)
        return get_transactions(wallet_address)

    if body["message"] != "OK":
        raise RuntimeError(f"unexpected response: {body}")
    return body["result"]


def get_internal_transactions(trans_hash: str):
    print(f"getting internal transactions for transaction {trans_hash}")
    resp = requests.get(
        f"https://api.etherscan.io/api?module=account&action=txlistinternal&txhash={trans_hash}&apikey={API_KEY}"
    )
    resp.raise_for_status()
    body = resp.json()

    if rate_limited(body):
        print("got rate limited, waiting to retry...")
        time.sleep(1)
        return get_internal_transactions(trans_hash)

    if body["message"] != "OK":
        raise RuntimeError(f"unexpected response: {body}")
    return body["result"]


def get_eoa(trans_hash: str):
    print(f"getting EOA address for transaction {trans_hash}")
    resp = requests.get(
        f"https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash={trans_hash}&apikey={API_KEY}"
    )
    resp.raise_for_status()
    body = resp.json()

    if rate_limited(body):
        print("got rate limited, waiting to retry...")
        time.sleep(1)
        return get_eoa(trans_hash)

    return body["result"]["from"]


def rate_limited(resp):
    return resp["result"] == "Max rate limit reached"


if __name__ == "__main__":
    main()
