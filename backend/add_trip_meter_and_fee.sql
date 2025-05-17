-- Add trip meter, time, and fee columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_meter INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_meter INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_fee NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS advance_paid NUMERIC(10,2);

-- Add extra charge columns to packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_hours INTEGER;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS per_km_rate NUMERIC(10,2);
ALTER TABLE packages ADD COLUMN IF NOT EXISTS per_hour_rate NUMERIC(10,2);
