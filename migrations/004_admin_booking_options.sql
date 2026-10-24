CREATE TABLE IF NOT EXISTS queue_settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL
);

INSERT INTO queue_settings (setting_key, setting_value) VALUES
  ('purposes', '["Testing", "MO Project", "CR Project", "New Product", "Nice Project"]'::jsonb),
  ('filaments', '["PLA-Basic", "PLA-Matte", "PETG-Basic", "PETG-HF", "ABS", "ABS-GF", "TPU 90A", "Onyx"]'::jsonb),
  ('colors', '["Black", "White", "Gray", "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown", "Clear", "Other"]'::jsonb),
  ('durations', '[0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 12, 16, 24]'::jsonb),
  ('times', '["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"]'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

