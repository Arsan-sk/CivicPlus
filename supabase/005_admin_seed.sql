-- ============================================
-- 005_ADMIN_SEED.SQL
-- Resolving Admin Authentication Database Seeding Instructions
-- ============================================

-- 1. SQL CLEANUP COMMANDS
-- If the Supabase Auth server throws status 500 AuthRetryableFetchErrors,
-- execute the following SQL inside the Supabase SQL Editor to clean up database corruption:
--
-- DELETE FROM auth.users WHERE email = 'admin@civicplus.com';
-- DELETE FROM public.profiles WHERE email = 'admin@civicplus.com';

-- 2. AUTOMATED MIGRATION SEED
-- Rather than raw SQL inserts (which bypass GoTrue validations and corrupt auth state),
-- run the self-contained Node migration script from the project root:
--
-- node seed-admin.js
--
-- This script leverages the Supabase Admin API and handles user creations securely.
