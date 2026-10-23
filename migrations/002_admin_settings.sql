CREATE TABLE IF NOT EXISTS printers (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  unit text NOT NULL CHECK (length(trim(unit)) > 0),
  enabled boolean NOT NULL DEFAULT true,
  color text NOT NULL DEFAULT '#6883a8'
);

INSERT INTO printers (id, name, unit, color) VALUES
  ('P1', 'Bambu Lab X1 Carbon', 'Printer 01', '#6883a8'),
  ('P2', 'Bambu Lab P1S', 'Printer 02', '#57a47d'),
  ('P3', 'Bambu Lab A1', 'Printer 03', '#d89a58'),
  ('P4', 'Bambu Lab P1P', 'Printer 04', '#9b7db0')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS queue_users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO queue_users (name)
SELECT DISTINCT trim(person) FROM jobs WHERE length(trim(person)) > 0
ON CONFLICT (name) DO NOTHING;
