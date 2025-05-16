-- Add driver_id column to bookings table
ALTER TABLE bookings ADD COLUMN driver_id INTEGER REFERENCES users(id);
