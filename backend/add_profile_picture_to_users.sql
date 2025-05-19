-- Add profile_picture_path column to users table for profile pictures
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_path TEXT;
