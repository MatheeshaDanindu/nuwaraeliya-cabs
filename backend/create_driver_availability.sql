-- Table for storing driver availability slots
CREATE TABLE driver_availability (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by driver
CREATE INDEX idx_driver_availability_driver_id ON driver_availability(driver_id);
