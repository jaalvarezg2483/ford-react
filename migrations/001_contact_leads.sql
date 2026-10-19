CREATE TABLE IF NOT EXISTS contact_leads (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  plate TEXT,
  department TEXT NOT NULL,
  branch TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_leads_created_at_idx ON contact_leads (created_at DESC);
