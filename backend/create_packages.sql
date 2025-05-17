-- Trip packages for vehicles
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    price_unit VARCHAR(20) NOT NULL DEFAULT 'Day', -- e.g. Day, Hour
    included_km INTEGER NOT NULL,
    km_unit VARCHAR(20) NOT NULL DEFAULT 'Day' -- e.g. Day, Trip
);

-- Add package_id to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_id INTEGER REFERENCES packages(id);
