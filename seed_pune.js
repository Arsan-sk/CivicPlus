import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Constants
const INDIA = 'a0000000-0000-0000-0000-000000000001';
const MAHARASHTRA = 'b0000000-0000-0000-0000-000000000001';
const PUNE_CITY_ID = 'c0000000-0000-0000-0000-000000000006';

const depts = [
  { id: 'd0000000-0000-0000-0006-000000000001', city_id: PUNE_CITY_ID, name: 'Road Department', description: 'Roads, bridges, and flyovers maintenance' },
  { id: 'd0000000-0000-0000-0006-000000000002', city_id: PUNE_CITY_ID, name: 'Electricity Department', description: 'Streetlights, power supply, and electrical infrastructure' },
  { id: 'd0000000-0000-0000-0006-000000000003', city_id: PUNE_CITY_ID, name: 'Water Supply Department', description: 'Water supply, pipelines, and leakage management' },
  { id: 'd0000000-0000-0000-0006-000000000004', city_id: PUNE_CITY_ID, name: 'Waste Management Department', description: 'Garbage collection, disposal, and cleanliness' },
  { id: 'd0000000-0000-0000-0006-000000000005', city_id: PUNE_CITY_ID, name: 'Drainage Department', description: 'Sewage, drainage, and flood management' }
];

const authorities = [
  {
    id: 'df000000-0000-0000-0001-000000000033',
    auth_id: 'da000000-0000-0000-0001-000000000033',
    email: 'mayor@punecorporation.gov.in',
    name: 'Murlidhar Mohol',
    username: 'mayor_pune_mohol',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: null,
    bio: 'Mayor of Pune. Focused on green development, smart city initiatives, and metro expansion.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000034',
    auth_id: 'da000000-0000-0000-0001-000000000034',
    email: 'commissioner@punecorporation.gov.in',
    name: 'Vikram Kumar',
    username: 'mc_pmc_vikram',
    position: 'Municipal Commissioner, PMC',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: null,
    bio: 'Municipal Commissioner, PMC. Dedicated to administrative efficiency and civic infrastructure.',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000035',
    auth_id: 'da000000-0000-0000-0001-000000000035',
    email: 'ward.shivajinagar@pmc.gov.in',
    name: 'Sanjay Kadam',
    username: 'ward_shivajinagar_kadam',
    position: 'Ward Officer, Shivajinagar Zone',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: null,
    bio: 'Ward Officer, Shivajinagar. Managing civic utilities and local grievances.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000036',
    auth_id: 'da000000-0000-0000-0001-000000000036',
    email: 'ward.kothrud@pmc.gov.in',
    name: 'Prashant Patil',
    username: 'ward_kothrud_patil',
    position: 'Ward Officer, Kothrud Zone',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: null,
    bio: 'Ward Officer, Kothrud. Handling localized citizen grievances and sanitation.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000037',
    auth_id: 'da000000-0000-0000-0001-000000000037',
    email: 'ward.hadapsar@pmc.gov.in',
    name: 'Ramesh Shinde',
    username: 'ward_hadapsar_shinde',
    position: 'Ward Officer, Hadapsar Zone',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: null,
    bio: 'Ward Officer, Hadapsar. Supporting road expansion and solid waste management.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000038',
    auth_id: 'da000000-0000-0000-0001-000000000038',
    email: 'ee.roads@pmc.gov.in',
    name: 'Milind Ranade',
    username: 'pmc_roads_ranade',
    position: 'Executive Engineer, PMC Road Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: 'd0000000-0000-0000-0006-000000000001',
    bio: 'Executive Engineer, PMC Roads. Overseeing main roads resurfacing and footpaths.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000039',
    auth_id: 'da000000-0000-0000-0001-000000000039',
    email: 'ee.elec@pmc.gov.in',
    name: 'Vikas Deshmukh',
    username: 'pmc_elec_deshmukh',
    position: 'Executive Engineer, PMC Electricity',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: 'd0000000-0000-0000-0006-000000000002',
    bio: 'Executive Engineer, PMC Electricity. Upgrading solar streetlights and cabling grids.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000003a',
    auth_id: 'da000000-0000-0000-0001-00000000003a',
    email: 'ee.water@pmc.gov.in',
    name: 'Avinash Prasad',
    username: 'pmc_water_prasad',
    position: 'Executive Engineer, PMC Water Supply',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: 'd0000000-0000-0000-0006-000000000003',
    bio: 'Executive Engineer, PMC Water Supply. Streamlining distribution grids and filtration plants.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000003b',
    auth_id: 'da000000-0000-0000-0001-00000000003b',
    email: 'ee.swm@pmc.gov.in',
    name: 'Nitin Kamble',
    username: 'pmc_swm_kamble',
    position: 'Executive Engineer, PMC Solid Waste Management',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: 'd0000000-0000-0000-0006-000000000004',
    bio: 'Executive Engineer, PMC Solid Waste. Enhancing sorting facilities and compost schemes.',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000003c',
    auth_id: 'da000000-0000-0000-0001-00000000003c',
    email: 'ee.drain@pmc.gov.in',
    name: 'Surendra Tambe',
    username: 'pmc_drain_tambe',
    position: 'Executive Engineer, PMC Drainage',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: PUNE_CITY_ID,
    department_id: 'd0000000-0000-0000-0006-000000000005',
    bio: 'Executive Engineer, PMC Drainage. Mitigating flood areas and culvert clearing.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  }
];

async function run() {
  console.log('--- SEEDING PUNE CITY AND DEPARTMENTS ---');
  
  // 1. Insert Pune City
  const { error: cityErr } = await supabase.from('cities').upsert({
    id: PUNE_CITY_ID,
    state_id: MAHARASHTRA,
    name: 'Pune',
    slug: 'pune',
    latitude: 18.5204,
    longitude: 73.8567,
    population: 3124440
  });

  if (cityErr) {
    console.error('Error seeding Pune City:', cityErr.message);
  } else {
    console.log('Successfully upserted Pune City.');
  }

  // 2. Insert Pune Departments
  for (const dept of depts) {
    const { error: deptErr } = await supabase.from('departments').upsert(dept);
    if (deptErr) {
      console.error(`Error seeding department ${dept.name}:`, deptErr.message);
    } else {
      console.log(`Successfully upserted department: ${dept.name}`);
    }
  }

  // 3. Insert Pune Authorities
  console.log('--- SEEDING PUNE AUTHORITIES SECURELY ---');
  for (const auth of authorities) {
    console.log(`Setting up user: ${auth.email}...`);

    try {
      await supabase.auth.admin.deleteUser(auth.id);
    } catch (e) {
      // ignore
    }

    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      id: auth.id,
      email: auth.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: auth.name,
        username: auth.username
      }
    });

    if (createError) {
      console.error(`  Error creating auth user ${auth.email}:`, createError.message);
      continue;
    }

    console.log(`  Success creating auth user: ${createData.user.id}`);

    console.log(`  Updating profile for ${auth.name}...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'authority',
        is_verified: true,
        country_id: INDIA,
        state_id: auth.state_id,
        city_id: auth.city_id,
        bio: auth.bio,
        avatar_url: auth.avatar_url
      })
      .eq('id', auth.id);

    if (profileError) {
      console.error(`    Profile update error:`, profileError.message);
      continue;
    }

    console.log(`  Inserting authority record for ${auth.position}...`);
    const { error: authorityError } = await supabase
      .from('authorities')
      .insert({
        id: auth.auth_id,
        profile_id: auth.id,
        position: auth.position,
        jurisdiction_level: auth.jurisdiction_level,
        country_id: INDIA,
        state_id: auth.state_id,
        city_id: auth.city_id,
        department_id: auth.department_id,
        is_verified: true,
        badge_type: 'official',
        verified_at: new Date().toISOString()
      });

    if (authorityError) {
      console.error(`    Authority insertion error:`, authorityError.message);
    }
  }

  console.log('--- SEEDING PUNE SUCCESSFULLY COMPLETED ---');
}

run().catch(console.error);
