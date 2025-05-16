-- SQL to create the vehicle_unavailability table
CREATE TABLE vehicle_unavailability (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason TEXT
);

-- Index for faster queries
CREATE INDEX idx_vehicle_unavailability_vehicle_id ON vehicle_unavailability(vehicle_id);
CREATE INDEX idx_vehicle_unavailability_time ON vehicle_unavailability(start_time, end_time);