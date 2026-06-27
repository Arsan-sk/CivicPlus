-- ============================================
-- CivicPulse Seed Data
-- Version: 1.0.0
-- Run AFTER 001_schema.sql and 003_functions.sql
-- ============================================

-- 1. COUNTRY
INSERT INTO countries (id, name, code) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'India', 'IN');

-- 2. STATES
INSERT INTO states (id, country_id, name, code) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Maharashtra', 'MH'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Delhi', 'DL'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Karnataka', 'KA'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Tamil Nadu', 'TN'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Telangana', 'TS');

-- 3. CITIES
INSERT INTO cities (id, state_id, name, slug, latitude, longitude, population) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Mumbai', 'mumbai', 19.0760, 72.8777, 20411000),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Delhi', 'delhi', 28.7041, 77.1025, 32941000),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Bengaluru', 'bengaluru', 12.9716, 77.5946, 13193000),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Chennai', 'chennai', 13.0827, 80.2707, 11235000),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Hyderabad', 'hyderabad', 17.3850, 78.4867, 10534000);

-- 4. DEPARTMENTS (per city)
INSERT INTO departments (id, city_id, name, description) VALUES
  -- Mumbai
  ('d0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0001-000000000005', 'c0000000-0000-0000-0000-000000000001', 'Drainage Department', 'Sewage, drainage, and flood management'),
  -- Delhi
  ('d0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0002-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0002-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Drainage Department', 'Sewage, drainage, and flood management'),
  -- Bengaluru
  ('d0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0003-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0003-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0003-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Drainage Department', 'Sewage, drainage, and flood management'),
  -- Chennai
  ('d0000000-0000-0000-0004-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0004-000000000002', 'c0000000-0000-0000-0000-000000000004', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0004-000000000003', 'c0000000-0000-0000-0000-000000000004', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0004-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0004-000000000005', 'c0000000-0000-0000-0000-000000000004', 'Drainage Department', 'Sewage, drainage, and flood management'),
  -- Hyderabad
  ('d0000000-0000-0000-0005-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Road Department', 'Roads, bridges, and flyovers maintenance'),
  ('d0000000-0000-0000-0005-000000000002', 'c0000000-0000-0000-0000-000000000005', 'Electricity Department', 'Streetlights, power supply, and electrical infrastructure'),
  ('d0000000-0000-0000-0005-000000000003', 'c0000000-0000-0000-0000-000000000005', 'Water Supply Department', 'Water supply, pipelines, and leakage management'),
  ('d0000000-0000-0000-0005-000000000004', 'c0000000-0000-0000-0000-000000000005', 'Waste Management Department', 'Garbage collection, disposal, and cleanliness'),
  ('d0000000-0000-0000-0005-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Drainage Department', 'Sewage, drainage, and flood management');

-- 5. ISSUE CATEGORIES
INSERT INTO issue_categories (id, name, slug, description, icon, color) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Pothole', 'pothole', 'Road potholes and surface damage', 'RoadHorizon', '#EF4444'),
  ('e0000000-0000-0000-0000-000000000002', 'Garbage', 'garbage', 'Waste accumulation and improper disposal', 'Trash', '#F59E0B'),
  ('e0000000-0000-0000-0000-000000000003', 'Water Leakage', 'water-leakage', 'Water pipeline leaks and wastage', 'Drop', '#3B82F6'),
  ('e0000000-0000-0000-0000-000000000004', 'Broken Streetlight', 'broken-streetlight', 'Non-functional or damaged streetlights', 'Lightbulb', '#8B5CF6'),
  ('e0000000-0000-0000-0000-000000000005', 'Damaged Infrastructure', 'damaged-infrastructure', 'Broken railings, bridges, buildings, public property', 'Buildings', '#EC4899'),
  ('e0000000-0000-0000-0000-000000000006', 'Drainage Problem', 'drainage-problem', 'Blocked drains, sewage overflow, waterlogging', 'Waves', '#06B6D4'),
  ('e0000000-0000-0000-0000-000000000007', 'Illegal Encroachment', 'illegal-encroachment', 'Unauthorized construction or occupation of public space', 'Warning', '#F97316'),
  ('e0000000-0000-0000-0000-000000000008', 'Traffic Issue', 'traffic-issue', 'Traffic signal problems, missing signs, road markings', 'TrafficCone', '#10B981'),
  ('e0000000-0000-0000-0000-000000000009', 'Public Safety', 'public-safety', 'Safety hazards, open manholes, exposed wires', 'ShieldWarning', '#DC2626'),
  ('e0000000-0000-0000-0000-000000000010', 'Other', 'other', 'Other civic issues not covered by specific categories', 'DotsThree', '#6B7280');
