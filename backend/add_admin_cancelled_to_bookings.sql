-- Migration to add admin_cancelled column to bookings table
ALTER TABLE bookings
ADD COLUMN admin_cancelled boolean DEFAULT false;
