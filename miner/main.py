import os
import time
from datetime import datetime
from typing import List, Dict

import dotenv

dotenv.load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
TARGET_STOCKS = os.getenv("TARGET_STOCKS", "BBRI,GOTO,ANTM").split(",")


def log(msg: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {msg}")


def fake_scrape_broker_summary(stock_code: str) -> List[Dict]:
    """
    Placeholder scraper.

    Nanti fungsi ini diganti dengan Playwright / scraping RTI / Stockbit.
    Untuk sementara, return data dummy agar alur integrasi ke Supabase bisa dites.
    """
    # Simulasi 2 broker
    return [
        {
            "stock_code": stock_code,
            "date": datetime.now().date().isoformat(),
            "broker_code": "ZP",
            "buy_value": 800000000,
            "sell_value": 200000000,
            "buy_lot": 1000,
            "sell_lot": 200
        },
        {
            "stock_code": stock_code,
            "date": datetime.now().date().isoformat(),
            "broker_code": "YP",
            "buy_value": 200000000,
            "sell_value": 600000000,
            "buy_lot": 300,
            "sell_lot": 900
        }
    ]


def main() -> None:
    log("BandarInsight miner started (dummy mode).")
    log(f"Target stocks: {TARGET_STOCKS}")

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        log("WARNING: Supabase env vars are not set. Miner will only print data and exit.")
    else:
        log("Supabase env vars detected, but upsert logic belum diimplementasikan di script ini.")

    for code in TARGET_STOCKS:
        code = code.strip().upper()
        if not code:
            continue
        log(f"Scraping (dummy) broker summary for {code}...")
        rows = fake_scrape_broker_summary(code)
        log(f"Got {len(rows)} dummy rows for {code}:")
        for r in rows:
            log(f"  {r}")

        # TODO:
        # - Tambahkan client Supabase (supabase-py atau HTTP) untuk upsert ke broker_transactions & stock_snapshots.

        time.sleep(2)

    log("Miner run finished.")


if __name__ == "__main__":
    main()