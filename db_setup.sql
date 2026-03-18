-- LogiSense AI Unified Platform - Production Schema
-- Run this in your Supabase SQL Editor

-- 1. Risk Events Table
CREATE TABLE IF NOT EXISTS risk_events (
  id TEXT PRIMARY KEY,
  title TEXT,
  severity TEXT,
  source TEXT,
  affected_shipments INTEGER,
  corridors TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- 2. Decisions (Blockchain Audits) Table
CREATE TABLE IF NOT EXISTS decisions (
  id SERIAL PRIMARY KEY,
  decision_id TEXT UNIQUE,
  action TEXT,
  on_chain BOOLEAN DEFAULT FALSE,
  sha256_hash TEXT,
  merkle_batch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for Risk Events
alter publication supabase_realtime add table risk_events;
