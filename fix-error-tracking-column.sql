-- Add missing created_at column to error_tracking table
-- This will fix the monitoring router errors

ALTER TABLE error_tracking 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have created_at values
UPDATE error_tracking 
SET created_at = first_seen 
WHERE created_at IS NULL;
