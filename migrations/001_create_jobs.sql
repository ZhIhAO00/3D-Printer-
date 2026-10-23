CREATE TABLE IF NOT EXISTS jobs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project text NOT NULL CHECK (length(trim(project)) > 0),
  person text NOT NULL CHECK (length(trim(person)) > 0),
  printer text NOT NULL CHECK (length(trim(printer)) > 0),
  start_time time NOT NULL,
  duration numeric(5,2) NOT NULL CHECK (duration > 0 AND duration <= 48),
  material text NOT NULL,
  status text NOT NULL DEFAULT 'Queued' CHECK (status IN ('Queued', 'Printing', 'Complete')),
  job_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_printer_date_start_idx
  ON jobs (printer, job_date, start_time);
