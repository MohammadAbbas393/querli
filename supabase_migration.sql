-- Run this in your Supabase SQL editor: https://bjqvapcrappekhlgvuvq.supabase.co

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  queries_used int NOT NULL DEFAULT 0,
  queries_limit int NOT NULL DEFAULT 50,
  connections_limit int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Connections (DB connection strings — stored encrypted)
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  db_type text NOT NULL,
  encrypted_url text NOT NULL,
  schema_cache text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON connections USING (auth.uid() = user_id);

-- Queries (history)
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES connections(id) ON DELETE SET NULL,
  question text NOT NULL,
  sql text,
  results jsonb,
  chart_type text,
  execution_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own queries" ON queries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own queries" ON queries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create free subscription on signup
CREATE OR REPLACE FUNCTION create_free_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, status, queries_used, queries_limit, connections_limit)
  VALUES (NEW.id, 'free', 'active', 0, 50, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_free_subscription();

-- Reset query counts monthly (run this via pg_cron or a cron job)
-- SELECT cron.schedule('reset-query-counts', '0 0 1 * *', $$UPDATE subscriptions SET queries_used = 0$$);
