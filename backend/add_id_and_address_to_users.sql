-- Migration to add id_card_path, address_proof_path, and approved columns to users table
ALTER TABLE users
ADD COLUMN id_card_path TEXT,
ADD COLUMN address_proof_path TEXT,
ADD COLUMN approved BOOLEAN DEFAULT FALSE;
