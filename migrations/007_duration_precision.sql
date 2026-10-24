-- Preserve minute-level duration entries without the rounding of numeric(5,2).
ALTER TABLE jobs
  ALTER COLUMN duration TYPE numeric(6,4)
  USING duration::numeric(6,4);
