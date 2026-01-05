-- BandarInsight Supabase Schema (MVP Core)

-- 1) broker_transactions
CREATE TABLE IF NOT EXISTS broker_transactions (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    broker_code VARCHAR(5) NOT NULL,
    buy_value BIGINT DEFAULT 0,
    sell_value BIGINT DEFAULT 0,
    buy_lot INT DEFAULT 0,
    sell_lot INT DEFAULT 0,
    avg_buy_price INT DEFAULT 0,
    avg_sell_price INT DEFAULT 0,
    net_value BIGINT GENERATED ALWAYS AS (buy_value - sell_value) STORED,
    net_lot INT GENERATED ALWAYS AS (buy_lot - sell_lot) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stock_code, date, broker_code)
);

CREATE INDEX IF NOT EXISTS idx_broker_tx_stock_date
    ON broker_transactions(stock_code, date);

CREATE INDEX IF NOT EXISTS idx_broker_tx_broker
    ON broker_transactions(broker_code);

-- 2) broker_master
CREATE TABLE IF NOT EXISTS broker_master (
    broker_code VARCHAR(5) PRIMARY KEY,
    broker_name VARCHAR(100),
    category VARCHAR(20) NOT NULL, -- 'RETAIL', 'LOCAL_INST', 'FOREIGN', 'MIXED'
    is_bandar BOOLEAN DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO broker_master (broker_code, broker_name, category, is_bandar, notes)
VALUES
    ('YP', 'Mirae Asset Sekuritas', 'RETAIL', FALSE, 'Dominan retail online'),
    ('PD', 'Mandiri Sekuritas', 'RETAIL', FALSE, 'Mix retail & institusi'),
    ('ZP', 'Morgan Stanley', 'FOREIGN', TRUE, 'Foreign broker utama'),
    ('BK', 'BNI Sekuritas', 'LOCAL_INST', TRUE, 'Institusi lokal besar'),
    ('AK', 'Kim Eng Sekuritas', 'FOREIGN', TRUE, 'Foreign aktif di bluechip'),
    ('MG', 'Maybank Sekuritas', 'MIXED', TRUE, 'Mix semua segmen'),
    ('NI', 'Nikko Sekuritas', 'RETAIL', FALSE, NULL),
    ('XL', 'Excel Sekuritas', 'RETAIL', FALSE, NULL)
ON CONFLICT (broker_code) DO NOTHING;

-- 3) stock_snapshots
CREATE TABLE IF NOT EXISTS stock_snapshots (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(10) NOT NULL,
    date DATE NOT NULL,
    last_price INT,
    price_change_pct DECIMAL(5,2),
    total_value BIGINT,
    total_lot BIGINT,
    foreign_net_value BIGINT,
    top_buyer_broker VARCHAR(5),
    top_seller_broker VARCHAR(5),
    accumulation_score INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stock_code, date)
);

CREATE INDEX IF NOT EXISTS idx_stock_snapshots_stock_date
    ON stock_snapshots(stock_code, date);

-- 4) ai_response_cache
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(10) NOT NULL,
    query_hash VARCHAR(64) NOT NULL,
    response_text TEXT NOT NULL,
    model_used VARCHAR(50),
    tokens_used INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(stock_code, query_hash)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry
    ON ai_response_cache(expires_at);

-- 5) market_sentiment_daily
CREATE TABLE IF NOT EXISTS market_sentiment_daily (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    ihsg_change_pct DECIMAL(5,2),
    foreign_net_total BIGINT,
    top_gainer_sector VARCHAR(50),
    top_loser_sector VARCHAR(50),
    market_mood VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- NOTE:
-- - RLS & policies sebaiknya diatur dari Supabase dashboard atau migrasi terpisah.
-- - Tabel lain seperti user_behavior_analytics dapat ditambahkan di fase berikutnya.