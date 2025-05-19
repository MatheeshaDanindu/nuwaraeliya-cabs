-- Add reviews table for customer ratings and comments on vehicles/drivers
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (booking_id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_driver_id ON reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
