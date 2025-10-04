-- Fix post.slug unique constraint to be created before foreign keys
-- This ensures comment.post_id can reference post.slug correctly

-- Add unique constraint to post.slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_post_slug'
    ) THEN
        ALTER TABLE "post" ADD CONSTRAINT "unique_post_slug" UNIQUE("slug");
    END IF;
END $$;
