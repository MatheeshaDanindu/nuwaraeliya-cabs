ALTER TABLE bookings
  ADD COLUMN payment_receipt_url TEXT,
  ADD COLUMN paid_at TIMESTAMP;
