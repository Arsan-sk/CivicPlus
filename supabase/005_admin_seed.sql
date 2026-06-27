-- ============================================
-- 005_ADMIN_SEED.SQL
-- Register admin user with credentials: admin@civicplus.com / password123
-- ============================================

-- 1. INSERT INTO AUTH.USERS TABLE
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  'ad311a77-3e3e-4b2a-8c5d-000000000000', -- static admin uuid
  '00000000-0000-0000-0000-000000000000',
  'admin@civicplus.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Platform Admin", "username": "admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2. INSERT OR UPDATE PROFILE TO ENSURE ADMINISTRATIVE PRIVILEGES
INSERT INTO public.profiles (
  id,
  full_name,
  username,
  role,
  avatar_url,
  bio,
  contribution_score,
  created_at,
  updated_at
) VALUES (
  'ad311a77-3e3e-4b2a-8c5d-000000000000',
  'Platform Admin',
  'admin',
  'admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'CivicPulse platform systems administrator.',
  999,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE 
SET role = 'admin', contribution_score = 999;
