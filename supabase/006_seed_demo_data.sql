-- =====================================================================
-- 006_SEED_DEMO_DATA.SQL
-- Seed data migration for CivicPulse demo
-- Provides 5 CMs, 30 citizens, 15 issues, and 6 civic discussions
-- with full relational engagement (supports, confirmations, comments, updates)
-- =====================================================================

-- 1. CLEAN UP PREVIOUS SEEDS (Idempotency)
DELETE FROM public.supports WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%'
);
DELETE FROM public.confirmations WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%'
);
DELETE FROM public.comments WHERE author_id IN (
  SELECT id FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%'
);
DELETE FROM public.reshares WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%'
);
DELETE FROM public.issue_timeline WHERE issue_id IN (
  SELECT id FROM public.issue_reports WHERE id::text LIKE 'i0000000-%'
);
DELETE FROM public.issue_updates WHERE author_id IN (
  SELECT id FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%'
);
DELETE FROM public.issue_reports WHERE id::text LIKE 'i0000000-%';
DELETE FROM public.discussions WHERE id::text LIKE 'dis00000-%';
DELETE FROM public.authorities WHERE id::text LIKE 'da000000-%';
DELETE FROM public.profiles WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%';
DELETE FROM auth.users WHERE id::text LIKE 'df000000-%' OR id::text LIKE 'f0000000-%';

-- 2. SEED CHIEF MINISTERS (auth.users)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('df000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'fadnavis@maharashtra.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Devendra Fadnavis", "username": "fadnavis_devendra"}', false, 'authenticated', 'authenticated'),
('df000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'rekha@delhi.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rekha Gupta", "username": "gupta_rekha"}', false, 'authenticated', 'authenticated'),
('df000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'vijay@tamilnadu.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "C. Joseph Vijay", "username": "vijay_joseph"}', false, 'authenticated', 'authenticated'),
('df000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'dk@karnataka.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "D. K. Shivakumar", "username": "shivakumar_dk"}', false, 'authenticated', 'authenticated'),
('df000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'revanth@telangana.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "A. Revanth Reddy", "username": "revanth_reddy"}', false, 'authenticated', 'authenticated');

-- Update CM Profiles (Country: India, verified, proper roles)
UPDATE public.profiles SET
  role = 'authority',
  is_verified = true,
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  bio = 'Deputy Chief Minister of Maharashtra. Managing state infrastructure, logistics, and civic policy initiatives.',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
WHERE id = 'df000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  role = 'authority',
  is_verified = true,
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  bio = 'Chief Minister of Delhi. Overseeing water conservation, green energy, and pollution management.',
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
WHERE id = 'df000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  role = 'authority',
  is_verified = true,
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  bio = 'Chief Minister of Tamil Nadu. Dedicated to green infrastructure, stormwater grids, and coastal restoration.',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
WHERE id = 'df000000-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  role = 'authority',
  is_verified = true,
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  bio = 'Deputy Chief Minister of Karnataka. Championing digital public utilities, Silicon Valley infrastructure, and lake cleanup.',
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
WHERE id = 'df000000-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  role = 'authority',
  is_verified = true,
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  bio = 'Chief Minister of Telangana. Accelerating Hyderabad IT grids, city sanitation, and clean drinking water.',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
WHERE id = 'df000000-0000-0000-0000-000000000005';

-- Insert into authorities table
INSERT INTO public.authorities (id, profile_id, position, jurisdiction_level, country_id, state_id, is_verified, verified_at) VALUES
('da000000-0000-0000-0000-000000000001', 'df000000-0000-0000-0000-000000000001', 'Chief Minister', 'state', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', true, now()),
('da000000-0000-0000-0000-000000000002', 'df000000-0000-0000-0000-000000000002', 'Chief Minister', 'state', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', true, now()),
('da000000-0000-0000-0000-000000000003', 'df000000-0000-0000-0000-000000000003', 'Chief Minister', 'state', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', true, now()),
('da000000-0000-0000-0000-000000000004', 'df000000-0000-0000-0000-000000000004', 'Chief Minister', 'state', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', true, now()),
('da000000-0000-0000-0000-000000000005', 'df000000-0000-0000-0000-000000000005', 'Chief Minister', 'state', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', true, now());


-- 3. SEED 30 CITIZENS (auth.users)
-- Mumbai
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('f0000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000000', 'abhijeet@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Abhijeet Dipke", "username": "abhijeet_dipke"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000000', 'aaditya@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Aaditya Thackeray", "username": "aaditya_t"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000000', 'priya.s@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Priya Sharma", "username": "priya_sharma"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000000', 'rohan.j@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rohan Joshi", "username": "rohan_joshi"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000000', 'meera.d@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Meera Deshmukh", "username": "meera_d"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000000', 'sameer.k@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sameer Kulkarni", "username": "sameer_k"}', false, 'authenticated', 'authenticated');

-- Delhi
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('f0000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000000', 'dhruv@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dhruv Rathee", "username": "dhruv_rathee"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000000', 'arvind@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Arvind Kejriwal", "username": "arvind_k"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000000', 'sunita@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sunita Narain", "username": "sunita_n"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000000', 'vikram.m@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Vikram Malhotra", "username": "vikram_m"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000000', 'ananya.p@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ananya Panday", "username": "ananya_p"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000000', 'kabir.s@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Kabir Singh", "username": "kabir_s"}', false, 'authenticated', 'authenticated');

-- Bengaluru
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('f0000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000000', 'khansir@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Khan Sir", "username": "khan_sir"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000000', 'nandan@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nandan Nilekani", "username": "nandan_n"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000000', 'sudha@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sudha Murthy", "username": "sudha_m"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000000', 'karthik.g@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Karthik Gowda", "username": "karthik_g"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000000', 'divya.s@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Divya Spandana", "username": "divya_s"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000000', 'rahul.h@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rahul Hegde", "username": "rahul_h"}', false, 'authenticated', 'authenticated');

-- Chennai
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('f0000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000000', 'stalin@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "M. K. Stalin", "username": "stalin_mk"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000000', 'kamal@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Kamal Haasan", "username": "kamal_h"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000000', 'chinmayi@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chinmayi Sripaada", "username": "chinmayi_s"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000000', 'ramesh.k@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ramesh Kumar", "username": "ramesh_k"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000000', 'shalini.i@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Shalini Iyer", "username": "shalini_i"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000000', 'vijay.k@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Vijay Kumar", "username": "vijay_k"}', false, 'authenticated', 'authenticated');

-- Hyderabad
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
('f0000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000000', 'ktr@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "K. T. Rama Rao", "username": "ktr_trsp"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000000', 'samantha@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Samantha Ruth", "username": "samantha_r"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000000', 'asad@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Asaduddin Owaisi", "username": "asad_owaisi"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0005-000000000004', '00000000-0000-0000-0000-000000000000', 'harsha.v@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Harsha Vardhan", "username": "harsha_v"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0005-000000000005', '00000000-0000-0000-0000-000000000000', 'srinivas.r@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Srinivas Rao", "username": "srinivas_r"}', false, 'authenticated', 'authenticated'),
('f0000000-0000-0000-0005-000000000006', '00000000-0000-0000-0000-000000000000', 'lakshmi.p@civicplus.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Lakshmi Prasanna", "username": "lakshmi_p"}', false, 'authenticated', 'authenticated');


-- 4. UPDATE CITIZEN LOCATIONS IN PROFILE TABLE
UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Civic activist promoting clean beaches and green spaces in Mumbai.',
  avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000001';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Local public representative. Working for sustainable development of Mumbai.',
  avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000002';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Resident of Dadar. Professional designer.',
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000003';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Public transport enthusiast in Mumbai.',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000004';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Student of marine sciences. Beach clean-up coordinator.',
  avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000005';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000001',
  city_id = 'c0000000-0000-0000-0000-000000000001',
  bio = 'Resident of Bandra. Software engineer.',
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
WHERE id = 'f0000000-0000-0000-0001-000000000006';

-- Delhi
UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Fact-checker, content creator and environmental educator.',
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000001';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Public advocate for municipal reforms and clean air initiatives in Delhi.',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000002';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Environmentalist and Director General of Center for Science and Environment.',
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000003';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Law student from Delhi. Grievance resolver.',
  avatar_url = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000004';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Student at Delhi University. Social helper.',
  avatar_url = 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000005';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000002',
  city_id = 'c0000000-0000-0000-0000-000000000002',
  bio = 'Resident of Dwarka. Cycling club organizer.',
  avatar_url = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
WHERE id = 'f0000000-0000-0000-0002-000000000006';

-- Bengaluru
UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Popular science teacher and educational developer.',
  avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000001';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Co-founder of Infosys. Promoter of Aadhaar and open-source civic tools.',
  avatar_url = 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000002';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Author, social worker, and Chairperson of Infosys Foundation.',
  avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000003';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Film producer and public volunteer in Bengaluru.',
  avatar_url = 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000004';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Resident of Koramangala. Working for women empowerment and lake restoration.',
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000005';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000003',
  city_id = 'c0000000-0000-0000-0000-000000000003',
  bio = 'Urban planner and cyclist. Resident of Whitefield.',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
WHERE id = 'f0000000-0000-0000-0003-000000000006';

-- Chennai
UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'Social representative in Chennai. Promoting sustainable water grids.',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000001';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'Artist and public volunteer advocating for lake conservation.',
  avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000002';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'Playback singer and activist for gender equality and safety.',
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000003';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'Teacher from Chennai. Working on waste segregation campaigns.',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000004';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'IT professional. Traffic coordinator volunteer.',
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000005';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000004',
  city_id = 'c0000000-0000-0000-0000-000000000004',
  bio = 'Resident of Velachery. Civic engineer.',
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
WHERE id = 'f0000000-0000-0000-0004-000000000006';

-- Hyderabad
UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'Local public volunteer working for tech parks expansion and clean sewage pipelines in Hyderabad.',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000001';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'Actor and social worker. Advocate for eco-friendly lake preservation in Hyderabad.',
  avatar_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000002';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'Public advocate for minority rights and town planning reforms.',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000003';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'Software architect in Gachibowli. Organizing garbage sorting programs.',
  avatar_url = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000004';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'Resident of Ameerpet. Entrepreneur.',
  avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000005';

UPDATE public.profiles SET
  country_id = 'a0000000-0000-0000-0000-000000000001',
  state_id = 'b0000000-0000-0000-0000-000000000005',
  city_id = 'c0000000-0000-0000-0000-000000000005',
  bio = 'IT developer. Cycling advocate in Hyderabad.',
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
WHERE id = 'f0000000-0000-0000-0005-000000000006';


-- 5. SEED 15 ISSUES
-- Mumbai (5 issues)
INSERT INTO public.issue_reports (id, author_id, title, description, category_id, severity, status, city_id, latitude, longitude, address, ward, assigned_department_id, assigned_authority_id) VALUES
('i0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0001-000000000001', 'Potholes during monsoon on Western Express Highway', 'Large craters formed near the Metro station, causing heavy traffic bottlenecks and multiple minor accidents.', 'e0000000-0000-0000-0000-000000000001', 'critical', 'in_progress', 'c0000000-0000-0000-0000-000000000001', 19.1234, 72.8567, 'Western Express Highway, Andheri East, Mumbai', 'Ward K-East', 'd0000000-0000-0000-0001-000000000001', 'da000000-0000-0000-0000-000000000001'),
('i0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0001-000000000002', 'Construction Dust at Real Estate Site in Lower Parel', 'A major commercial highrise project is violating green net construction rules, releasing massive dust into the residential area nearby.', 'e0000000-0000-0000-0000-000000000010', 'medium', 'submitted', 'c0000000-0000-0000-0000-000000000001', 18.9950, 72.8250, 'Senapati Bapat Marg, Lower Parel, Mumbai', 'Ward G-South', 'd0000000-0000-0000-0001-000000000004', NULL),
('i0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0001-000000000003', 'Broken Footpath near Dadar Station', 'The paving stones of the pedestrian sidewalk are broken and caving in, making it extremely unsafe for senior citizens.', 'e0000000-0000-0000-0000-000000000005', 'low', 'resolved_by_authority', 'c0000000-0000-0000-0000-000000000001', 19.0178, 72.8478, 'Station Road, Dadar West, Mumbai', 'Ward G-North', 'd0000000-0000-0000-0001-000000000001', 'da000000-0000-0000-0000-000000000001'),
('i0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0001-000000000004', 'Bridge maintenance issues at Gokhale Bridge', 'Major cracks visible on the side columns of the bridge. Heavy structural inspection needed immediately before monsoon.', 'e0000000-0000-0000-0000-000000000005', 'critical', 'seen_by_authority', 'c0000000-0000-0000-0000-000000000001', 19.1190, 72.8465, 'Gokhale Bridge, Andheri, Mumbai', 'Ward K-East', 'd0000000-0000-0000-0001-000000000001', NULL),
('i0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0001-000000000005', 'Garbage Accumulation on Versova Beach', 'Plastic and medical waste accumulated on the shoreline, posing severe threat to marine life and local visitors.', 'e0000000-0000-0000-0000-000000000002', 'medium', 'community_verification_pending', 'c0000000-0000-0000-0000-000000000001', 19.1350, 72.7980, 'Versova Beach, Mumbai', 'Ward K-West', 'd0000000-0000-0000-0001-000000000004', NULL);

-- Delhi (3 issues)
INSERT INTO public.issue_reports (id, author_id, title, description, category_id, severity, status, city_id, latitude, longitude, address, ward, assigned_department_id, assigned_authority_id) VALUES
('i0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0002-000000000001', 'Severe Air Pollution due to Waste Burning in Okhla', 'Regular open burning of industrial plastic and rubber waste during night hours, choking nearby residential colonies.', 'e0000000-0000-0000-0000-000000000010', 'critical', 'in_progress', 'c0000000-0000-0000-0000-000000000002', 28.5355, 77.2874, 'Okhla Industrial Area Phase III, New Delhi', 'Ward 102S', 'd0000000-0000-0000-0002-000000000004', 'da000000-0000-0000-0000-000000000002'),
('i0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0002-000000000002', 'Overflowing Garbage Dump near Connaught Place', 'Public trash bins are overflowing for days. The stinking smell has spread across the footpath, blocking pedestrians.', 'e0000000-0000-0000-0000-000000000002', 'medium', 'community_verified', 'c0000000-0000-0000-0000-000000000002', 28.6304, 77.2177, 'Outer Circle, Connaught Place, New Delhi', 'Ward 88N', 'd0000000-0000-0000-0002-000000000004', NULL),
('i0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0002-000000000003', 'Waterlogging near ITO intersection', 'Flooding of roads even after minor rainfall due to blocked drainage inlets, causing massive traffic delays.', 'e0000000-0000-0000-0000-000000000006', 'high', 'awaiting_community_verification', 'c0000000-0000-0000-0000-000000000002', 28.6272, 77.2438, 'ITO Junction, New Delhi', 'Ward 95E', 'd0000000-0000-0000-0002-000000000005', NULL);

-- Bengaluru (2 issues)
INSERT INTO public.issue_reports (id, author_id, title, description, category_id, severity, status, city_id, latitude, longitude, address, ward, assigned_department_id, assigned_authority_id) VALUES
('i0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0003-000000000001', 'Extreme Traffic Congestion at Silk Board Junction', 'Due to construction work and faulty light timers, traffic is stuck for hours during peak morning and evening times.', 'e0000000-0000-0000-0000-000000000008', 'high', 'in_progress', 'c0000000-0000-0000-0000-000000000003', 12.9172, 77.6228, 'Central Silk Board Junction, Hosur Road, Bengaluru', 'Ward 191', 'd0000000-0000-0000-0003-000000000001', 'da000000-0000-0000-0000-000000000004'),
('i0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0003-000000000002', 'Lake Pollution & Toxic Foam at Bellandur Lake', 'Untreated chemical waste and sewage being discharged directly into the lake, creating massive clouds of white toxic foam.', 'e0000000-0000-0000-0000-000000000010', 'critical', 'community_verified', 'c0000000-0000-0000-0000-000000000003', 12.9304, 77.6784, 'Bellandur Lake Bed, Bengaluru', 'Ward 150', 'd0000000-0000-0000-0003-000000000005', NULL);

-- Chennai (3 issues)
INSERT INTO public.issue_reports (id, author_id, title, description, category_id, severity, status, city_id, latitude, longitude, address, ward, assigned_department_id, assigned_authority_id) VALUES
('i0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0004-000000000001', 'Waterlogging and Flooding in Velachery', 'Poor storm water drain infrastructure has caused severe flooding and water log in low-lying residential sectors.', 'e0000000-0000-0000-0000-000000000006', 'critical', 'in_progress', 'c0000000-0000-0000-0000-000000000004', 12.9780, 80.2180, 'Velachery Main Road, Chennai', 'Ward 177', 'd0000000-0000-0000-0004-000000000005', 'da000000-0000-0000-0000-000000000003'),
('i0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0004-000000000002', 'Garbage Dump Accumulation in Pallikaranai Marshland', 'Unmanaged municipal waste dump expanding into the protected eco-sensitive marshland habitat.', 'e0000000-0000-0000-0000-000000000002', 'critical', 'community_verified', 'c0000000-0000-0000-0000-000000000004', 12.9460, 80.2190, 'Pallikaranai Dumping Ground, Chennai', 'Ward 180', 'd0000000-0000-0000-0004-000000000004', NULL),
('i0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0004-000000000003', 'Severe Road Damage and Potholes in T. Nagar', 'Top surface of the asphalt road completely eroded, leaving large gravel particles and deep potholes exposed.', 'e0000000-0000-0000-0000-000000000001', 'medium', 'submitted', 'c0000000-0000-0000-0000-000000000004', 13.0400, 80.2330, 'Usman Road, T. Nagar, Chennai', 'Ward 113', 'd0000000-0000-0000-0004-000000000001', NULL);

-- Hyderabad (2 issues)
INSERT INTO public.issue_reports (id, author_id, title, description, category_id, severity, status, city_id, latitude, longitude, address, ward, assigned_department_id, assigned_authority_id) VALUES
('i0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0005-000000000001', 'Sewage Overflow and Drainage Block in Ameerpet', 'Overflowing sewer manholes flooding the main shopping lanes with dirty water, causing severe stink.', 'e0000000-0000-0000-0000-000000000006', 'high', 'in_progress', 'c0000000-0000-0000-0000-000000000005', 17.4374, 78.4482, 'Ameerpet Cross Roads, Hyderabad', 'Ward 92', 'd0000000-0000-0000-0005-000000000005', 'da000000-0000-0000-0000-000000000005'),
('i0000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0005-000000000002', 'Open Manhole Hazard near Gachibowli IT Corridor', 'Manhole cover missing on the service road. Extremely dangerous for two-wheelers navigating during dark hours.', 'e0000000-0000-0000-0000-000000000009', 'critical', 'closed', 'c0000000-0000-0000-0000-000000000005', 17.4401, 78.3489, 'Hitec City Road, Gachibowli, Hyderabad', 'Ward 104', 'd0000000-0000-0000-0005-000000000005', NULL);

-- Override the default AFTER INSERT trigger statuses for seeded issue_reports so they reflect their correct statuses
UPDATE public.issue_reports SET status = 'in_progress' WHERE id = 'i0000000-0000-0000-0000-000000000001';
UPDATE public.issue_reports SET status = 'submitted' WHERE id = 'i0000000-0000-0000-0000-000000000002';
UPDATE public.issue_reports SET status = 'resolved_by_authority' WHERE id = 'i0000000-0000-0000-0000-000000000003';
UPDATE public.issue_reports SET status = 'seen_by_authority' WHERE id = 'i0000000-0000-0000-0000-000000000004';
UPDATE public.issue_reports SET status = 'community_verification_pending' WHERE id = 'i0000000-0000-0000-0000-000000000005';
UPDATE public.issue_reports SET status = 'in_progress' WHERE id = 'i0000000-0000-0000-0000-000000000006';
UPDATE public.issue_reports SET status = 'community_verified' WHERE id = 'i0000000-0000-0000-0000-000000000007';
UPDATE public.issue_reports SET status = 'awaiting_community_verification' WHERE id = 'i0000000-0000-0000-0000-000000000008';
UPDATE public.issue_reports SET status = 'in_progress' WHERE id = 'i0000000-0000-0000-0000-000000000009';
UPDATE public.issue_reports SET status = 'community_verified' WHERE id = 'i0000000-0000-0000-0000-000000000010';
UPDATE public.issue_reports SET status = 'in_progress' WHERE id = 'i0000000-0000-0000-0000-000000000011';
UPDATE public.issue_reports SET status = 'community_verified' WHERE id = 'i0000000-0000-0000-0000-000000000012';
UPDATE public.issue_reports SET status = 'submitted' WHERE id = 'i0000000-0000-0000-0000-000000000013';
UPDATE public.issue_reports SET status = 'in_progress' WHERE id = 'i0000000-0000-0000-0000-000000000014';
UPDATE public.issue_reports SET status = 'closed' WHERE id = 'i0000000-0000-0000-0000-000000000015';


-- 6. SEED MEDIA FOR DISPATCHED ISSUES
INSERT INTO public.issue_media (issue_id, media_url, media_type, sort_order) VALUES
('i0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600', 'image', 0),
('i0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600', 'image', 0),
('i0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600', 'image', 0),
('i0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600', 'image', 0),
('i0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=600', 'image', 0);


-- 7. SEED ENGAGEMENT (supports, confirmations, comments)
-- Issue 1 supports (8 supports)
INSERT INTO public.supports (user_id, issue_id) VALUES
('f0000000-0000-0000-0001-000000000002', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0001-000000000003', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0001-000000000004', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0001-000000000005', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0001-000000000006', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0002-000000000001', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0002-000000000002', 'i0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0003-000000000001', 'i0000000-0000-0000-0000-000000000001');

-- Issue 1 confirmations (5 confirmations)
INSERT INTO public.confirmations (user_id, issue_id, confirmation_type) VALUES
('f0000000-0000-0000-0001-000000000002', 'i0000000-0000-0000-0000-000000000001', 'existence'),
('f0000000-0000-0000-0001-000000000003', 'i0000000-0000-0000-0000-000000000001', 'existence'),
('f0000000-0000-0000-0001-000000000004', 'i0000000-0000-0000-0000-000000000001', 'existence'),
('f0000000-0000-0000-0001-000000000005', 'i0000000-0000-0000-0000-000000000001', 'existence'),
('f0000000-0000-0000-0001-000000000006', 'i0000000-0000-0000-0000-000000000001', 'existence');

-- Issue 1 comments
INSERT INTO public.comments (author_id, issue_id, content) VALUES
('f0000000-0000-0000-0001-000000000003', 'i0000000-0000-0000-0000-000000000001', 'I had a flat tire here last night, BMC needs to fix this ASAP.'),
('df000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000001', 'I have requested the Mumbai Road Department to deploy dry mix patch work teams tonight.');

-- Issue 6 supports (6 supports)
INSERT INTO public.supports (user_id, issue_id) VALUES
('f0000000-0000-0000-0002-000000000002', 'i0000000-0000-0000-0000-000000000006'),
('f0000000-0000-0000-0002-000000000003', 'i0000000-0000-0000-0000-000000000006'),
('f0000000-0000-0000-0002-000000000004', 'i0000000-0000-0000-0000-000000000006'),
('f0000000-0000-0000-0002-000000000005', 'i0000000-0000-0000-0000-000000000006'),
('f0000000-0000-0000-0002-000000000006', 'i0000000-0000-0000-0000-000000000006'),
('f0000000-0000-0000-0001-000000000001', 'i0000000-0000-0000-0000-000000000006');

-- Issue 6 confirmations
INSERT INTO public.confirmations (user_id, issue_id, confirmation_type) VALUES
('f0000000-0000-0000-0002-000000000002', 'i0000000-0000-0000-0000-000000000006', 'existence'),
('f0000000-0000-0000-0002-000000000003', 'i0000000-0000-0000-0000-000000000006', 'existence'),
('f0000000-0000-0000-0002-000000000004', 'i0000000-0000-0000-0000-000000000006', 'existence');

-- Issue 6 comments
INSERT INTO public.comments (author_id, issue_id, content) VALUES
('f0000000-0000-0000-0002-000000000003', 'i0000000-0000-0000-0000-000000000006', 'The toxic smoke is visible from the metro station. Highly hazardous.'),
('df000000-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000006', 'Inspection completed by DPCC. Fines served to the operating unit.');

-- Issue 9 supports (5 supports)
INSERT INTO public.supports (user_id, issue_id) VALUES
('f0000000-0000-0000-0003-000000000002', 'i0000000-0000-0000-0000-000000000009'),
('f0000000-0000-0000-0003-000000000003', 'i0000000-0000-0000-0000-000000000009'),
('f0000000-0000-0000-0003-000000000004', 'i0000000-0000-0000-0000-000000000009'),
('f0000000-0000-0000-0003-000000000005', 'i0000000-0000-0000-0000-000000000009'),
('f0000000-0000-0000-0003-000000000006', 'i0000000-0000-0000-0000-000000000009');

-- Issue 9 confirmations
INSERT INTO public.confirmations (user_id, issue_id, confirmation_type) VALUES
('f0000000-0000-0000-0003-000000000002', 'i0000000-0000-0000-0000-000000000009', 'existence'),
('f0000000-0000-0000-0003-000000000003', 'i0000000-0000-0000-0000-000000000009', 'existence');

-- Issue 9 comments
INSERT INTO public.comments (author_id, issue_id, content) VALUES
('f0000000-0000-0000-0003-000000000003', 'i0000000-0000-0000-0000-000000000009', 'Silk Board needs a bypass routing for heavy vehicles during mornings.');


-- 8. TIMELINE UPDATES FOR CRITICAL ISSUES
-- Issue 1 timeline logs
INSERT INTO public.issue_timeline (issue_id, actor_id, previous_status, new_status, note) VALUES
('i0000000-0000-0000-0000-000000000001', 'df000000-0000-0000-0000-000000000001', 'community_verification_pending', 'seen_by_authority', 'Site inspection completed by local engineer.'),
('i0000000-0000-0000-0000-000000000001', 'df000000-0000-0000-0000-000000000001', 'seen_by_authority', 'in_progress', 'Repair crew assigned. Patching scheduled for tonight.');

-- Issue 6 timeline logs
INSERT INTO public.issue_timeline (issue_id, actor_id, previous_status, new_status, note) VALUES
('i0000000-0000-0000-0000-000000000006', 'df000000-0000-0000-0000-000000000002', 'community_verification_pending', 'seen_by_authority', 'DPCC team visited site. Industrial waste incineration noted.'),
('i0000000-0000-0000-0000-000000000006', 'df000000-0000-0000-0000-000000000002', 'seen_by_authority', 'in_progress', 'Legal show-cause notice served to the factory manager.');

-- Issue 9 timeline logs
INSERT INTO public.issue_timeline (issue_id, actor_id, previous_status, new_status, note) VALUES
('i0000000-0000-0000-0000-000000000009', 'df000000-0000-0000-0000-000000000004', 'community_verification_pending', 'seen_by_authority', 'Traffic police commissioner notified regarding signaling delay.'),
('i0000000-0000-0000-0000-000000000009', 'df000000-0000-0000-0000-000000000004', 'seen_by_authority', 'in_progress', 'Reprogrammed smart signaling timers deployed.');


-- 9. SEED CIVIC DISCUSSIONS (6 posts)
INSERT INTO public.discussions (id, author_id, content, discussion_type, city_id) VALUES
('dis00000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0003-000000000001', 'We need strict transparency and centralized tech audits for national exams. Millions of student futures are at stake in the upcoming NEET reforms.', 'opinion', 'c0000000-0000-0000-0000-000000000003'),
('dis00000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0002-000000000001', 'E20 petrol blending is rolling out very fast across India. But does your vehicle engine support it? Share your experience with mileage drop or spark plug issues.', 'awareness', 'c0000000-0000-0000-0000-000000000002'),
('dis00000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0001-000000000001', 'The delay in TET exam results is leaving many qualified teacher candidates unemployed. We suggest implementing a fixed yearly academic calendar.', 'suggestion', 'c0000000-0000-0000-0000-000000000001'),
('dis00000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0002-000000000003', 'Water levels are dropping. Let us compile working rainwater harvesting designs for apartment complexes in Delhi and Bengaluru.', 'suggestion', 'c0000000-0000-0000-0000-000000000002'),
('dis00000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0003-000000000002', 'Releasing open APIs for citizen grievance tracking could revolutionize how local ward authorities prioritize budget spending.', 'awareness', 'c0000000-0000-0000-0000-000000000003'),
('dis00000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0003-000000000003', 'Most citizens do not know that they can attend ward committee meetings. I suggest cities publicize meeting schedules on WhatsApp channels.', 'suggestion', 'c0000000-0000-0000-0000-000000000003');

-- Seed discussion supports
INSERT INTO public.supports (user_id, discussion_id) VALUES
('f0000000-0000-0000-0003-000000000002', 'dis00000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0003-000000000003', 'dis00000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0002-000000000002', 'dis00000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0002-000000000003', 'dis00000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0001-000000000003', 'dis00000-0000-0000-0000-000000000003');

-- Seed discussion comments
INSERT INTO public.comments (author_id, discussion_id, content) VALUES
('f0000000-0000-0000-0003-000000000003', 'dis00000-0000-0000-0000-000000000001', 'Absolutely agree! Computer-based testing with double encryption is the way forward.'),
('f0000000-0000-0000-0002-000000000002', 'dis00000-0000-0000-0000-000000000002', 'I noticed a slight engine knocking on my old bike after filling blended petrol.');


-- 10. RECALCULATE STATISTICS TO ENFORCE 100% INTEGRITY
-- Sync counts on discussions
UPDATE public.discussions d
SET
  support_count = (SELECT COUNT(*) FROM public.supports WHERE discussion_id = d.id),
  comment_count = (SELECT COUNT(*) FROM public.comments WHERE discussion_id = d.id);

-- Sync counts on issue reports
UPDATE public.issue_reports ir
SET
  support_count = (SELECT COUNT(*) FROM public.supports WHERE issue_id = ir.id),
  confirmation_count = (SELECT COUNT(*) FROM public.confirmations WHERE issue_id = ir.id AND confirmation_type = 'existence'),
  resolution_confirmation_count = (SELECT COUNT(*) FROM public.confirmations WHERE issue_id = ir.id AND confirmation_type = 'resolution'),
  comment_count = (SELECT COUNT(*) FROM public.comments WHERE issue_id = ir.id);

-- Sync profiles counts and scores
UPDATE public.profiles p
SET
  issues_raised_count = (SELECT COUNT(*) FROM public.issue_reports WHERE author_id = p.id),
  issues_resolved_count = (SELECT COUNT(*) FROM public.issue_reports ir WHERE ir.author_id = p.id AND ir.status IN ('closed', 'community_verified_resolution')),
  supports_given_count = (SELECT COUNT(*) FROM public.supports WHERE user_id = p.id),
  confirmations_given_count = (SELECT COUNT(*) FROM public.confirmations WHERE user_id = p.id),
  contribution_score = (
    (SELECT COUNT(*) FROM public.issue_reports WHERE author_id = p.id) * 10 +
    (SELECT COUNT(*) FROM public.supports WHERE user_id = p.id) * 2 +
    (SELECT COUNT(*) FROM public.confirmations WHERE user_id = p.id) * 5 +
    (SELECT COUNT(*) FROM public.comments WHERE author_id = p.id) * 3
  )
WHERE p.id::text LIKE 'df000000-%' OR p.id::text LIKE 'f0000000-%';

-- Sync authorities counts
UPDATE public.authorities a
SET
  assigned_issues_count = (
    SELECT COUNT(*) FROM public.issue_reports ir
    JOIN public.cities c ON ir.city_id = c.id
    WHERE c.state_id = a.state_id
  ),
  resolved_issues_count = (
    SELECT COUNT(*) FROM public.issue_reports ir
    JOIN public.cities c ON ir.city_id = c.id
    WHERE c.state_id = a.state_id AND ir.status IN ('closed', 'community_verified_resolution', 'resolved_by_authority')
  )
WHERE a.id::text LIKE 'da000000-%';
