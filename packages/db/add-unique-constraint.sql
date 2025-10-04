-- Add unique constraint to post.slug before running db:push:force
-- This must be executed first to avoid foreign key constraint errors

ALTER TABLE post ADD CONSTRAINT unique_post_slug UNIQUE (slug);
