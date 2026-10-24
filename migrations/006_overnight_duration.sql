-- Add the overnight duration used for a 5:30 PM to 9:00 AM booking.
-- Preserve administrator-managed values and keep the list in numeric order.
UPDATE queue_settings
SET setting_value = (
  SELECT jsonb_agg(value ORDER BY (value #>> '{}')::numeric)
  FROM jsonb_array_elements(setting_value || '[15.5]'::jsonb) AS items(value)
)
WHERE setting_key = 'durations'
  AND jsonb_typeof(setting_value) = 'array'
  AND NOT setting_value @> '[15.5]'::jsonb;

