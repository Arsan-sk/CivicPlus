-- ============================================
-- CivicPulse Seed Data - Pune City & Authorities
-- Version: 1.0.0
-- ============================================

-- 1. INSERT CITY PUNE
INSERT INTO public.cities (id, state_id, name, slug, latitude, longitude, population) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Pune', 'pune', 18.5204, 73.8567, 3124440)
ON CONFLICT (id) DO NOTHING;

-- 2. INSERT PUNE DEPARTMENTS
INSERT INTO public.departments (id, city_id, name, description) VALUES
  ('d0000000-0000-0000-0006-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0006-000000000002', 'c0000000-0000-0000-0000-000000000006', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0006-000000000003', 'c0000000-0000-0000-0000-000000000006', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0006-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0006-000000000005', 'c0000000-0000-0000-0000-000000000006', 'Drainage Department', 'Sewage, drainage, and flood management')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT PUNE AUTH USERS
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud) VALUES
  ('df000000-0000-0000-0001-000000000033', '00000000-0000-0000-0000-000000000000', 'mayor@punecorporation.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Murlidhar Mohol", "username": "mayor_pune_mohol"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000034', '00000000-0000-0000-0000-000000000000', 'commissioner@punecorporation.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Vikram Kumar", "username": "mc_pmc_vikram"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000035', '00000000-0000-0000-0000-000000000000', 'ward.shivajinagar@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Sanjay Kadam", "username": "ward_shivajinagar_kadam"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000036', '00000000-0000-0000-0000-000000000000', 'ward.kothrud@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Prashant Patil", "username": "ward_kothrud_patil"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000037', '00000000-0000-0000-0000-000000000000', 'ward.hadapsar@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Ramesh Shinde", "username": "ward_hadapsar_shinde"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000038', '00000000-0000-0000-0000-000000000000', 'ee.roads@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Milind Ranade", "username": "pmc_roads_ranade"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-000000000039', '00000000-0000-0000-0000-000000000000', 'ee.elec@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Vikas Deshmukh", "username": "pmc_elec_deshmukh"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-00000000003a', '00000000-0000-0000-0000-000000000000', 'ee.water@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Avinash Prasad", "username": "pmc_water_prasad"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-00000000003b', '00000000-0000-0000-0000-000000000000', 'ee.swm@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Nitin Kamble", "username": "pmc_swm_kamble"}', false, 'authenticated', 'authenticated'),
  ('df000000-0000-0000-0001-00000000003c', '00000000-0000-0000-0000-000000000000', 'ee.drain@pmc.gov.in', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Surendra Tambe", "username": "pmc_drain_tambe"}', false, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT public.profiles FOR PUNE
INSERT INTO public.profiles (id, full_name, username, email, role, is_verified, country_id, state_id, city_id, bio, avatar_url) VALUES
  ('df000000-0000-0000-0001-000000000033', 'Murlidhar Mohol', 'mayor_pune_mohol', 'mayor@punecorporation.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Mayor of Pune. Focused on green development, smart city initiatives, and metro expansion.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('df000000-0000-0000-0001-000000000034', 'Vikram Kumar', 'mc_pmc_vikram', 'commissioner@punecorporation.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Municipal Commissioner, PMC. Dedicated to administrative efficiency and civic infrastructure.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
  ('df000000-0000-0000-0001-000000000035', 'Sanjay Kadam', 'ward_shivajinagar_kadam', 'ward.shivajinagar@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Ward Officer, Shivajinagar. Managing civic utilities and local grievances.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
  ('df000000-0000-0000-0001-000000000036', 'Prashant Patil', 'ward_kothrud_patil', 'ward.kothrud@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Ward Officer, Kothrud. Handling localized citizen grievances and sanitation.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('df000000-0000-0000-0001-000000000037', 'Ramesh Shinde', 'ward_hadapsar_shinde', 'ward.hadapsar@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Ward Officer, Hadapsar. Supporting road expansion and solid waste management.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('df000000-0000-0000-0001-000000000038', 'Milind Ranade', 'pmc_roads_ranade', 'ee.roads@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Executive Engineer, PMC Roads. Overseeing main roads resurfacing and footpaths.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('df000000-0000-0000-0001-000000000039', 'Vikas Deshmukh', 'pmc_elec_deshmukh', 'ee.elec@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Executive Engineer, PMC Electricity. Upgrading solar streetlights and cabling grids.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
  ('df000000-0000-0000-0001-00000000003a', 'Avinash Prasad', 'pmc_water_prasad', 'ee.water@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Executive Engineer, PMC Water Supply. Streamlining distribution grids and filtration plants.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
  ('df000000-0000-0000-0001-00000000003b', 'Nitin Kamble', 'pmc_swm_kamble', 'ee.swm@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Executive Engineer, PMC Solid Waste. Enhancing sorting facilities and compost schemes.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'),
  ('df000000-0000-0000-0001-00000000003c', 'Surendra Tambe', 'pmc_drain_tambe', 'ee.drain@pmc.gov.in', 'authority', true, 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'Executive Engineer, PMC Drainage. Mitigating flood areas and culvert clearing.', 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  is_verified = EXCLUDED.is_verified,
  country_id = EXCLUDED.country_id,
  state_id = EXCLUDED.state_id,
  city_id = EXCLUDED.city_id,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

-- 5. INSERT public.authorities FOR PUNE
INSERT INTO public.authorities (id, profile_id, position, jurisdiction_level, country_id, state_id, city_id, department_id, badge_type, is_verified, verified_at) VALUES
  ('da000000-0000-0000-0001-000000000033', 'df000000-0000-0000-0001-000000000033', 'Mayor', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, 'official', true, now()),
  ('da000000-0000-0000-0001-000000000034', 'df000000-0000-0000-0001-000000000034', 'Municipal Commissioner, PMC', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, 'official', true, now()),
  ('da000000-0000-0000-0001-000000000035', 'df000000-0000-0000-0001-000000000035', 'Ward Officer, Shivajinagar Zone', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, 'official', true, now()),
  ('da000000-0000-0000-0001-000000000036', 'df000000-0000-0000-0001-000000000036', 'Ward Officer, Kothrud Zone', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, 'official', true, now()),
  ('da000000-0000-0000-0001-000000000037', 'df000000-0000-0000-0001-000000000037', 'Ward Officer, Hadapsar Zone', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', NULL, 'official', true, now()),
  ('da000000-0000-0000-0001-000000000038', 'df000000-0000-0000-0001-000000000038', 'Executive Engineer, PMC Road Department', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000001', 'official', true, now()),
  ('da000000-0000-0000-0001-000000000039', 'df000000-0000-0000-0001-000000000039', 'Executive Engineer, PMC Electricity', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000002', 'official', true, now()),
  ('da000000-0000-0000-0001-00000000003a', 'df000000-0000-0000-0001-00000000003a', 'Executive Engineer, PMC Water Supply', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000003', 'official', true, now()),
  ('da000000-0000-0000-0001-00000000003b', 'df000000-0000-0000-0001-00000000003b', 'Executive Engineer, PMC Solid Waste Management', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000004', 'official', true, now()),
  ('da000000-0000-0000-0001-00000000003c', 'df000000-0000-0000-0001-00000000003c', 'Executive Engineer, PMC Drainage', 'city', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000005', 'official', true, now())
ON CONFLICT (id) DO NOTHING;
