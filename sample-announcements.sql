-- Sample announcements for testing the announcement display system
-- Run this in your database tool to create test announcements

-- First, let's get the first admin user ID from your database
-- Replace 'REPLACE_WITH_ADMIN_USER_ID' with an actual admin user ID from your users table
-- You can find this by running: SELECT id FROM users WHERE role = 'admin' LIMIT 1;

-- Option 1: If you have an admin user, replace the created_by values below
-- Option 2: Use the INSERT with subquery approach (commented out below)

INSERT INTO announcements (id, title, content, type, priority, is_dismissible, is_active, target_audience, start_date, end_date, created_by, created_at, updated_at) VALUES
-- High priority announcement for everyone
('sample-001', 'Welcome to Our New Website!', 'We''ve redesigned our website with new features and improved performance. Explore and let us know what you think!', 'info', 2, true, true, NULL, NOW(), NULL, (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW(), NOW()),

-- Urgent announcement for all users
('sample-002', 'Scheduled Maintenance Tonight', 'Our servers will undergo maintenance tonight from 2 AM to 4 AM EST. Some features may be temporarily unavailable.', 'warning', 4, true, true, NULL, NOW(), NOW() + INTERVAL '7 days', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW(), NOW()),

-- Success announcement
('sample-003', 'New Features Released!', 'We''ve just released exciting new features including dark mode, improved search, and better mobile experience.', 'success', 3, true, true, NULL, NOW(), NOW() + INTERVAL '14 days', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW(), NOW()),

-- Admin-only announcement
('sample-004', 'Admin Dashboard Updates', 'New analytics and user management features have been added to the admin dashboard. Check them out!', 'info', 1, true, true, '{"roles": ["admin"]}', NOW(), NOW() + INTERVAL '30 days', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW(), NOW()),

-- Error/critical announcement
('sample-005', 'Security Update Required', 'Please update your password as part of our routine security enhancement. Click your profile to change your password.', 'error', 5, false, true, NULL, NOW(), NOW() + INTERVAL '3 days', (SELECT id FROM users WHERE role = 'admin' LIMIT 1), NOW(), NOW());

-- Alternative: If you don't have any admin users yet, create a system user first:
-- INSERT INTO users (id, name, email, role, created_at, updated_at) VALUES 
-- ('system-admin', 'System Admin', 'admin@system.local', 'admin', NOW(), NOW())
-- ON CONFLICT (id) DO NOTHING;
-- 
-- Then use 'system-admin' as the created_by value in the announcements above.
