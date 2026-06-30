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

// City, State, Country constants
const INDIA = 'a0000000-0000-0000-0000-000000000001';
const MAHARASHTRA = 'b0000000-0000-0000-0000-000000000001';
const DELHI_STATE = 'b0000000-0000-0000-0000-000000000002';
const KARNATAKA = 'b0000000-0000-0000-0000-000000000003';
const TAMIL_NADU = 'b0000000-0000-0000-0000-000000000004';
const TELANGANA = 'b0000000-0000-0000-0000-000000000005';

const MUMBAI = 'c0000000-0000-0000-0000-000000000001';
const DELHI_CITY = 'c0000000-0000-0000-0000-000000000002';
const BENGALURU = 'c0000000-0000-0000-0000-000000000003';
const CHENNAI = 'c0000000-0000-0000-0000-000000000004';
const HYDERABAD = 'c0000000-0000-0000-0000-000000000005';

// Authorities Data
const authorities = [
  // --- MUMBAI ---
  {
    id: 'df000000-0000-0000-0001-000000000001',
    auth_id: 'da000000-0000-0000-0001-000000000001',
    email: 'commissioner@mcgm.gov.in',
    name: 'Bhushan Gagrani',
    username: 'mc_bmc_gagrani',
    position: 'Municipal Commissioner, BMC',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: null,
    bio: 'Municipal Commissioner, BMC. Managing city planning and public administration in Mumbai.',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000002',
    auth_id: 'da000000-0000-0000-0001-000000000002',
    email: 'ward.ke@mcgm.gov.in',
    name: 'Manish Valanju',
    username: 'ward_k_east_manish',
    position: 'Ward Officer, Ward 24 - K East',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: null,
    bio: 'Ward Officer, Ward 24 - K East. Managing localized grievances, waste disposal, and ward safety.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000003',
    auth_id: 'da000000-0000-0000-0001-000000000003',
    email: 'ward.gs@mcgm.gov.in',
    name: 'Santoshkumar Dhonde',
    username: 'ward_g_south_santosh',
    position: 'Ward Officer, Ward 12 - G South',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: null,
    bio: 'Ward Officer, Ward 12 - G South. Championing storm water drain upgrades and clean streets.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000004',
    auth_id: 'da000000-0000-0000-0001-000000000004',
    email: 'ward.hw@mcgm.gov.in',
    name: 'Vinayak Vispute',
    username: 'ward_h_west_vinayak',
    position: 'Ward Officer, Ward 8 - H West',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: null,
    bio: 'Ward Officer, Ward 8 - H West. Focused on citizen infrastructure transparency and urban greening.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000005',
    auth_id: 'da000000-0000-0000-0001-000000000005',
    email: 'ee.roads@mcgm.gov.in',
    name: 'Abhijeet Pawar',
    username: 'bmc_roads_pawar',
    position: 'Executive Engineer, Road Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: 'd0000000-0000-0000-0001-000000000001',
    bio: 'Executive Engineer, BMC Road Department. Coordinating pothole filling and bridge repairs.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000006',
    auth_id: 'da000000-0000-0000-0001-000000000006',
    email: 'ee.elec@mcgm.gov.in',
    name: 'Sudhir Salve',
    username: 'bmc_elec_salve',
    position: 'Executive Engineer, Electricity Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: 'd0000000-0000-0000-0001-000000000002',
    bio: 'Executive Engineer, BMC Electricity. Restoring damaged streetlights and electrical lines.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000007',
    auth_id: 'da000000-0000-0000-0001-000000000007',
    email: 'ee.water@mcgm.gov.in',
    name: 'Ramesh Bamble',
    username: 'bmc_water_bamble',
    position: 'Executive Engineer, Water Supply Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: 'd0000000-0000-0000-0001-000000000003',
    bio: 'Executive Engineer, Water Supply Department. Rectifying leaks and managing pipeline pressure.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000008',
    auth_id: 'da000000-0000-0000-0001-000000000008',
    email: 'ee.swm@mcgm.gov.in',
    name: 'Kiran Dighavkar',
    username: 'bmc_swm_kiran',
    position: 'Executive Engineer, Waste Management Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: 'd0000000-0000-0000-0001-000000000004',
    bio: 'Executive Engineer, Solid Waste Management. Leading garbage sorting and clean ward drives.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000009',
    auth_id: 'da000000-0000-0000-0001-000000000009',
    email: 'ee.drainage@mcgm.gov.in',
    name: 'Vidyadhar Khandekar',
    username: 'bmc_drainage_khandekar',
    position: 'Executive Engineer, Drainage Department',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: 'd0000000-0000-0000-0001-000000000005',
    bio: 'Executive Engineer, BMC Storm Water Drains. Managing culvert decluttering and flood barriers.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  },

  // --- DELHI ---
  {
    id: 'df000000-0000-0000-0001-00000000000a',
    auth_id: 'da000000-0000-0000-0001-00000000000a',
    email: 'commissioner@mcd.nic.in',
    name: 'Gyanesh Bharti',
    username: 'commissioner_mcd',
    position: 'Municipal Commissioner, MCD',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: null,
    bio: 'Municipal Commissioner, MCD. Promoting tech integration in civic governance.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000000b',
    auth_id: 'da000000-0000-0000-0001-00000000000b',
    email: 'ward.okhla@mcd.nic.in',
    name: 'Amit Kumar',
    username: 'ward_okhla_amit',
    position: 'Ward Officer, Okhla Zone',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: null,
    bio: 'Ward Officer, Okhla Zone. Resolving local congestion and garbage problems.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000000c',
    auth_id: 'da000000-0000-0000-0001-00000000000c',
    email: 'ward.kb@mcd.nic.in',
    name: 'Sanjay Rawat',
    username: 'ward_kb_rawat',
    position: 'Ward Officer, Karol Bagh Zone',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: null,
    bio: 'Ward Officer, Karol Bagh Zone. Enhancing water distribution grids and local security.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000000d',
    auth_id: 'da000000-0000-0000-0001-00000000000d',
    email: 'ward.rohini@mcd.nic.in',
    name: 'Rajesh Gehlot',
    username: 'ward_rohini_gehlot',
    position: 'Ward Officer, Rohini Zone',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: null,
    bio: 'Ward Officer, Rohini Zone. Committed to smart city streetlighting and park upkeep.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000000e',
    auth_id: 'da000000-0000-0000-0001-00000000000e',
    email: 'ee.roads@mcd.nic.in',
    name: 'Vijay Singh',
    username: 'mcd_roads_singh',
    position: 'Executive Engineer, PWD Roads',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: 'd0000000-0000-0000-0002-000000000001',
    bio: 'Executive Engineer, PWD Roads. Overseeing main arterial road reconstructions.',
    avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000000f',
    auth_id: 'da000000-0000-0000-0001-00000000000f',
    email: 'ee.elec@mcd.nic.in',
    name: 'S. K. Dhattarwal',
    username: 'mcd_elec_skd',
    position: 'Executive Engineer, MCD Streetlights',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: 'd0000000-0000-0000-0002-000000000002',
    bio: 'Executive Engineer, MCD Streetlights. Implementing LED streetlight conversions.',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000010',
    auth_id: 'da000000-0000-0000-0001-000000000010',
    email: 'ee.water@delhijalboard.nic.in',
    name: 'P. K. Gupta',
    username: 'djb_water_gupta',
    position: 'Chief Engineer, Delhi Jal Board',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: 'd0000000-0000-0000-0002-000000000003',
    bio: 'Chief Engineer, Delhi Jal Board. Overseeing sewage plants and fresh water pipelines.',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000011',
    auth_id: 'da000000-0000-0000-0001-000000000011',
    email: 'ee.swm@mcd.nic.in',
    name: 'Pradeep Khandelwal',
    username: 'mcd_swm_pradeep',
    position: 'Chief Engineer, Waste Management MCD',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: 'd0000000-0000-0000-0002-000000000004',
    bio: 'Chief Engineer, Waste Management MCD. Driving landfill cleanups and recycling hubs.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000012',
    auth_id: 'da000000-0000-0000-0001-000000000012',
    email: 'ee.drain@mcd.nic.in',
    name: 'Anil Kumar',
    username: 'mcd_drain_anil',
    position: 'Executive Engineer, Storm Water Drains MCD',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: 'd0000000-0000-0000-0002-000000000005',
    bio: 'Executive Engineer, Storm Water Drains MCD. Clearing blockages in Delhi drainage grids.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  },

  // --- BENGALURU ---
  {
    id: 'df000000-0000-0000-0001-000000000013',
    auth_id: 'da000000-0000-0000-0001-000000000013',
    email: 'commissioner@bbmp.gov.in',
    name: 'Tushar Giri Nath',
    username: 'commissioner_bbmp',
    position: 'Chief Commissioner, BBMP',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: null,
    bio: 'Chief Commissioner, BBMP. Dedicated to Silicon Valley infrastructure restoration.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000014',
    auth_id: 'da000000-0000-0000-0001-000000000014',
    email: 'ac.bellandur@bbmp.gov.in',
    name: 'Jagadeesh Kumar',
    username: 'ward_bellandur_jagadeesh',
    position: 'Ward Officer, Bellandur Ward 150',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: null,
    bio: 'Ward Officer, Bellandur Ward 150. Dealing with local traffic bottle-necks and lake safety.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000015',
    auth_id: 'da000000-0000-0000-0001-000000000015',
    email: 'ac.whitefield@bbmp.gov.in',
    name: 'K. Ramesh',
    username: 'ward_wf_ramesh',
    position: 'Ward Officer, Whitefield Ward 84',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: null,
    bio: 'Ward Officer, Whitefield Ward 84. Spearheading tech park logistics and water supply.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000016',
    auth_id: 'da000000-0000-0000-0001-000000000016',
    email: 'ac.indiranagar@bbmp.gov.in',
    name: 'S. M. Prasad',
    username: 'ward_in_prasad',
    position: 'Ward Officer, Indiranagar Ward 80',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: null,
    bio: 'Ward Officer, Indiranagar Ward 80. Preserving green reserves and clearing pedestrian pathways.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000017',
    auth_id: 'da000000-0000-0000-0001-000000000017',
    email: 'ee.roads@bbmp.gov.in',
    name: 'B. S. Prahlad',
    username: 'bbmp_roads_prahlad',
    position: 'Chief Engineer, BBMP Roads & Infrastructure',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: 'd0000000-0000-0000-0003-000000000001',
    bio: 'Chief Engineer, BBMP Roads & Infrastructure. Fixing potholes and installing pedestrian grids.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000018',
    auth_id: 'da000000-0000-0000-0001-000000000018',
    email: 'ee.elec@bbmp.gov.in',
    name: 'G. H. Nagaraj',
    username: 'bbmp_elec_nagaraj',
    position: 'Executive Engineer, BBMP Electrical Dept',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: 'd0000000-0000-0000-0003-000000000002',
    bio: 'Executive Engineer, BBMP Electrical. Handling streetlighting failures and overhead wires.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000019',
    auth_id: 'da000000-0000-0000-0001-000000000019',
    email: 'ee.water@bwssb.gov.in',
    name: 'V. Manohar',
    username: 'bwssb_water_manohar',
    position: 'Executive Engineer, BWSSB Water Supply',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: 'd0000000-0000-0000-0003-000000000003',
    bio: 'Executive Engineer, BWSSB. Streamlining drinking water supply pipelines.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000001a',
    auth_id: 'da000000-0000-0000-0001-00000000001a',
    email: 'ee.swm@bbmp.gov.in',
    name: 'Sarfaraz Khan',
    username: 'bbmp_swm_sarfaraz',
    position: 'Joint Commissioner, Solid Waste Management BBMP',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: 'd0000000-0000-0000-0003-000000000004',
    bio: 'Joint Commissioner, Solid Waste BBMP. Expanding compost programs and landfill controls.',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000001b',
    auth_id: 'da000000-0000-0000-0001-00000000001b',
    email: 'ee.storm@bbmp.gov.in',
    name: 'K. V. Jagadeesh',
    username: 'bbmp_storm_jagadeesh',
    position: 'Executive Engineer, Storm Water Drains BBMP',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: 'd0000000-0000-0000-0003-000000000005',
    bio: 'Executive Engineer, Storm Water Drains BBMP. Overseeing rajakaaluve lake channels.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  },

  // --- CHENNAI ---
  {
    id: 'df000000-0000-0000-0001-00000000001c',
    auth_id: 'da000000-0000-0000-0001-00000000001c',
    email: 'commissioner@chennaicorporation.gov.in',
    name: 'J. Radhakrishnan',
    username: 'commissioner_gcc',
    position: 'Commissioner, Greater Chennai Corporation',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: null,
    bio: 'Commissioner, Greater Chennai Corporation. Building coastal and stormwater resilience.',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000001d',
    auth_id: 'da000000-0000-0000-0001-00000000001d',
    email: 'ward.chromepet@gcc.gov.in',
    name: 'K. Balaji',
    username: 'ward_chrome_balaji',
    position: 'Ward Officer, Chromepet Zone',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: null,
    bio: 'Ward Officer, Chromepet Zone. Tracking electricity outages and regional storm networks.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000001e',
    auth_id: 'da000000-0000-0000-0001-00000000001e',
    email: 'ward.mylapore@gcc.gov.in',
    name: 'S. Ramanathan',
    username: 'ward_myla_ramanathan',
    position: 'Ward Officer, Mylapore Zone',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: null,
    bio: 'Ward Officer, Mylapore Zone. Preserving local historic public property and road safety.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000001f',
    auth_id: 'da000000-0000-0000-0001-00000000001f',
    email: 'ward.adyar@gcc.gov.in',
    name: 'T. M. Suresh',
    username: 'ward_adyar_suresh',
    position: 'Ward Officer, Adyar Zone',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: null,
    bio: 'Ward Officer, Adyar Zone. Improving garbage separation systems and local parks.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000020',
    auth_id: 'da000000-0000-0000-0001-000000000020',
    email: 'ee.roads@gcc.gov.in',
    name: 'M. Palanisamy',
    username: 'gcc_roads_palanisamy',
    position: 'Executive Engineer, GCC Roads Department',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: 'd0000000-0000-0000-0004-000000000001',
    bio: 'Executive Engineer, GCC Roads. Upgrading pedestrian tracks and resurfacing tar roads.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000021',
    auth_id: 'da000000-0000-0000-0001-000000000021',
    email: 'ee.elec@gcc.gov.in',
    name: 'R. Srinivasan',
    username: 'gcc_elec_srinivasan',
    position: 'Superintending Engineer, GCC Electricals',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: 'd0000000-0000-0000-0004-000000000002',
    bio: 'Superintending Engineer, GCC Electricals. Stabilizing power supply grids during storms.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000022',
    auth_id: 'da000000-0000-0000-0001-000000000022',
    email: 'ee.water@cmwssb.gov.in',
    name: 'K. Ashok Kumar',
    username: 'cmwssb_water_ashok',
    position: 'Area Engineer, Chennai Metro Water (CMWSSB)',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: 'd0000000-0000-0000-0004-000000000003',
    bio: 'Area Engineer, Chennai Metro Water. Mitigating tank storage declines and water scarcity.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000023',
    auth_id: 'da000000-0000-0000-0001-000000000023',
    email: 'ee.swm@gcc.gov.in',
    name: 'N. Mahesan',
    username: 'gcc_swm_mahesan',
    position: 'Chief Engineer, Solid Waste Management GCC',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: 'd0000000-0000-0000-0004-000000000004',
    bio: 'Chief Engineer, GCC Waste Management. Overlooking waste audits and landfill control.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000024',
    auth_id: 'da000000-0000-0000-0001-000000000024',
    email: 'ee.drain@gcc.gov.in',
    name: 'S. Rajendran',
    username: 'gcc_drain_rajendran',
    position: 'Executive Engineer, Storm Water Drains GCC',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: 'd0000000-0000-0000-0004-000000000005',
    bio: 'Executive Engineer, Storm Water GCC. Maintaining bay outlet gates and drainage pipes.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  },

  // --- HYDERABAD ---
  {
    id: 'df000000-0000-0000-0001-000000000025',
    auth_id: 'da000000-0000-0000-0001-000000000025',
    email: 'commissioner@ghmc.gov.in',
    name: 'Ronald Rose',
    username: 'commissioner_ghmc',
    position: 'Commissioner, GHMC',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: null,
    bio: 'Commissioner, GHMC. Enhancing smart sanitation and traffic grid systems.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000026',
    auth_id: 'da000000-0000-0000-0001-000000000026',
    email: 'ward.jh@ghmc.gov.in',
    name: 'M. Rajendra Prasad',
    username: 'ward_jh_rajendra',
    position: 'Ward Officer, Jubilee Hills Zone',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: null,
    bio: 'Ward Officer, Jubilee Hills Zone. Resolving local lane blocks and garbage complaints.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000027',
    auth_id: 'da000000-0000-0000-0001-000000000027',
    email: 'ward.gachibowli@ghmc.gov.in',
    name: 'P. Venkata Ramana',
    username: 'ward_gachibowli_ramana',
    position: 'Ward Officer, Gachibowli Zone',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: null,
    bio: 'Ward Officer, Gachibowli Zone. Directing park cleanliness and local street projects.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000028',
    auth_id: 'da000000-0000-0000-0001-000000000028',
    email: 'ward.secunderabad@ghmc.gov.in',
    name: 'D. Srinivas Reddy',
    username: 'ward_sec_srinivas',
    position: 'Ward Officer, Secunderabad Zone',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: null,
    bio: 'Ward Officer, Secunderabad Zone. Improving local roads and pipeline problems.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000029',
    auth_id: 'da000000-0000-0000-0001-000000000029',
    email: 'ee.roads@ghmc.gov.in',
    name: 'L. Vasantha',
    username: 'ghmc_roads_vasantha',
    position: 'Superintending Engineer, GHMC Projects (Roads)',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: 'd0000000-0000-0000-0005-000000000001',
    bio: 'Superintending Engineer, GHMC Projects. Fixing potholes and installing road markings.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002a',
    auth_id: 'da000000-0000-0000-0001-00000000002a',
    email: 'ee.elec@ghmc.gov.in',
    name: 'K. Srinivas',
    username: 'ghmc_elec_srinivas',
    position: 'Executive Engineer, GHMC Streetlights',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: 'd0000000-0000-0000-0005-000000000002',
    bio: 'Executive Engineer, GHMC Streetlights. Handling streetlight breakdowns and cables.',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002b',
    auth_id: 'da000000-0000-0000-0001-00000000002b',
    email: 'ee.water@hmwssb.gov.in',
    name: 'M. Krishna',
    username: 'hmwssb_water_krishna',
    position: 'General Manager, HMWSSB Operations',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: 'd0000000-0000-0000-0005-000000000003',
    bio: 'General Manager, HMWSSB Operations. Directing main water filtration and leakage grids.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002c',
    auth_id: 'da000000-0000-0000-0001-00000000002c',
    email: 'ee.swm@ghmc.gov.in',
    name: 'V. Damodar',
    username: 'ghmc_swm_damodar',
    position: 'Joint Commissioner, Sanitation GHMC',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: 'd0000000-0000-0000-0005-000000000004',
    bio: 'Joint Commissioner, Sanitation GHMC. Organizing garbage segregation and dumping bins.',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002d',
    auth_id: 'da000000-0000-0000-0001-00000000002d',
    email: 'ee.drain@ghmc.gov.in',
    name: 'B. Harilal',
    username: 'ghmc_drain_harilal',
    position: 'Executive Engineer, Storm Water Drains GHMC',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: 'd0000000-0000-0000-0005-000000000005',
    bio: 'Executive Engineer, Storm Drains GHMC. Managing canal clearance and sewage controls.',
    avatar_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002e',
    auth_id: 'da000000-0000-0000-0001-00000000002e',
    email: 'mayor@mcgm.gov.in',
    name: 'Kishori Pednekar',
    username: 'mayor_mumbai_pednekar',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: MAHARASHTRA,
    city_id: MUMBAI,
    department_id: null,
    bio: 'Mayor of Mumbai. Leading the civic governance and citizen representation.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-00000000002f',
    auth_id: 'da000000-0000-0000-0001-00000000002f',
    email: 'mayor@mcd.nic.in',
    name: 'Shelly Oberoi',
    username: 'mayor_delhi_oberoi',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: DELHI_STATE,
    city_id: DELHI_CITY,
    department_id: null,
    bio: 'Mayor of Delhi. Championing primary education and municipal health systems.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000030',
    auth_id: 'da000000-0000-0000-0001-000000000030',
    email: 'mayor@bbmp.gov.in',
    name: 'Sampath Raj',
    username: 'mayor_blr_sampath',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: KARNATAKA,
    city_id: BENGALURU,
    department_id: null,
    bio: 'Mayor of Bengaluru. Enhancing Silicon Valley waste management and public transit.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000031',
    auth_id: 'da000000-0000-0000-0001-000000000031',
    email: 'mayor@chennaicorporation.gov.in',
    name: 'R. Priya',
    username: 'mayor_chennai_priya',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: TAMIL_NADU,
    city_id: CHENNAI,
    department_id: null,
    bio: 'Mayor of Chennai. Focused on modernizing corporation schools and urban healthcare.',
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150'
  },
  {
    id: 'df000000-0000-0000-0001-000000000032',
    auth_id: 'da000000-0000-0000-0001-000000000032',
    email: 'mayor@ghmc.gov.in',
    name: 'Gadwal Vijayalakshmi',
    username: 'mayor_hyd_vijayalakshmi',
    position: 'Mayor',
    jurisdiction_level: 'city',
    state_id: TELANGANA,
    city_id: HYDERABAD,
    department_id: null,
    bio: 'Mayor of Hyderabad. Advocating for green urban corridors and smart policing.',
    avatar_url: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150'
  }
];

// Discussions
const discussions = [
  {
    id: 'd1500000-0000-0000-0001-000000000001',
    author_id: 'f0000000-0000-0000-0002-000000000004', // Vikram Malhotra
    content: `NEET-UG 2026 Paper Leak Fallout: Students Protesting Outside NTA Office, Okhla

The recent decision to cancel the exam and the subsequent CBI probe has left lakhs of students in absolute despair. We have been protesting outside the NTA office here in Okhla. The level of frustration with the National Testing Agency is at an all-time high. When will we see actual accountability in our national entrance examination system? We cannot let the hard work of millions of students be ruined by leaks and systemic corruption. #NEET2026 #PaperLeak #Protest #NTAAccountability`,
    discussion_type: 'opinion',
    city_id: DELHI_CITY,
    created_at: '2026-06-22T10:00:00+05:30',
    updated_at: '2026-06-22T10:00:00+05:30'
  },
  {
    id: 'd1500000-0000-0000-0001-000000000002',
    author_id: 'f0000000-0000-0000-0002-000000000006', // Kabir Singh
    content: `Mass protest march to Lok Bhavan over exam system accountability.

Just witnessed heavy police deployment and barricades being set up near Lok Bhavan as hundreds of students and citizens started marching to demand reform in the national testing system. The atmosphere is tense but peaceful so far. If you are commuting through this area, expect major traffic diversions. We need our voices heard, but please stay safe, everyone! #DelhiProtest #LokBhavan #CitizenEyewitness #ExamReform`,
    discussion_type: 'awareness',
    city_id: DELHI_CITY,
    created_at: '2026-06-24T11:30:00+05:30',
    updated_at: '2026-06-24T11:30:00+05:30'
  },
  {
    id: 'd1500000-0000-0000-0001-000000000003',
    author_id: 'f0000000-0000-0000-0001-000000000004', // Rohan Joshi
    content: `Mumbai's pre-monsoon prep failed again — BMC official falls into the same potholes citizens have been reporting for years.

The ultimate irony of Mumbai's monsoon: an inspecting BMC official falls into the very drainage manhole/potholes we have been raising alerts about! While it's unfortunate, maybe now the municipal administration will realize the daily risks citizens take. Let's make this a constructive push for reform: can we mandate geotagged open-drain tracking across all wards? We pay our taxes; the bare minimum we deserve is safe roads. #MumbaiMonsoon #BMCFailed #CivicAccountability #RoadSafety`,
    discussion_type: 'opinion',
    city_id: MUMBAI,
    created_at: '2026-06-25T18:20:00+05:30',
    updated_at: '2026-06-25T18:20:00+05:30'
  },
  {
    id: 'd1500000-0000-0000-0001-000000000004',
    author_id: 'f0000000-0000-0000-0003-000000000004', // Karthik Gowda
    content: `Freedom Park rally on education accountability — what does this mean for local civic infrastructure spending?

We saw a massive turnout at Freedom Park today protesting the national exam discrepancies. The energy is inspiring, but it also raises a broader point: if we can gather for national issues, we must demand the same transparency and accountability in local civic spending. Bengaluru's infrastructure budget needs to be publicly audited. When tax funds are diverted or mismanaged, our roads, schools, and lakes suffer. Hyperlocal transparency is the foundation of national accountability. #Bengaluru #FreedomPark #CivicInfrastructure #BudgetTransparency`,
    discussion_type: 'opinion',
    city_id: BENGALURU,
    created_at: '2026-06-27T10:10:00+05:30',
    updated_at: '2026-06-27T10:10:00+05:30'
  },
  {
    id: 'd1500000-0000-0000-0001-000000000005',
    author_id: 'f0000000-0000-0000-0004-000000000004', // Ramesh Kumar
    content: `Scheduled power outages across Chromepet, Pallavaram, Sembium — anyone else affected?

TANGEDCO has announced load shedding and scheduled outages lasting up to 5 hours in Chromepet, Pallavaram, and Sembium. During this intense heatwave, sitting without electricity is absolute torture. The local substation says it's due to transformer maintenance, but we experience this every summer. Is anyone else facing constant trips or low voltage in these areas? Let's compile a list of affected streets to escalate to the division engineer. #ChennaiPowerCut #Chromepet #Heatwave #TANGEDCO`,
    discussion_type: 'awareness',
    city_id: CHENNAI,
    created_at: '2026-06-28T14:20:00+05:30',
    updated_at: '2026-06-28T14:20:00+05:30'
  },
  {
    id: 'd1500000-0000-0000-0001-000000000006',
    author_id: 'f0000000-0000-0000-0005-000000000005', // Srinivas Rao
    content: `Why hyperlocal platforms like this matter — accountability shouldn't only trend during election season.

It's easy to post grievances and debate when elections are around the corner, but real democracy works when citizens monitor ward activities daily. Hyperlocal platforms like CivicPulse allow us to keep tabs on local streetlights, garbage collection, and water pipelines when nobody else is looking. Let us keep the engagement active, support each other's reports, and hold our respective ward officers accountable all year round. Real change begins at our doorstep. #CivicEngagement #Hyperlocal #Hyderabad #CitizenPower`,
    discussion_type: 'opinion',
    city_id: HYDERABAD,
    created_at: '2026-06-29T17:00:00+05:30',
    updated_at: '2026-06-29T17:00:00+05:30'
  }
];

// Issue Reports
const issues = [
  {
    id: '15500000-0000-0000-0001-000000000001',
    author_id: 'f0000000-0000-0000-0001-000000000003', // Priya Sharma
    title: 'Open manhole near King\'s Circle, Dr. Babasaheb Ambedkar Road — extremely dangerous in monsoon water',
    description: 'An open manhole near King\'s Circle on Dr. Babasaheb Ambedkar Road is completely submerged under monsoon waterlogging, making it a death trap for pedestrians and motorists. Shockingly, a BMC official himself fell into an uncovered maintenance hole during a pre-monsoon inspection nearby. This highlights the absolute negligence. The hole must be covered immediately before a tragedy occurs.',
    category_id: 'e0000000-0000-0000-0000-000000000006', // Drainage Problem
    severity: 'critical',
    status: 'community_verification_pending',
    city_id: MUMBAI,
    latitude: 19.0268,
    longitude: 72.8570,
    address: 'Dr. Babasaheb Ambedkar Road, near King\'s Circle, Mumbai',
    ward: 'Ward 12 - G South',
    created_at: '2026-06-25T15:45:00+05:30',
    updated_at: '2026-06-25T15:45:00+05:30'
  },
  {
    id: '15500000-0000-0000-0001-000000000002',
    author_id: 'f0000000-0000-0000-0004-000000000005', // Shalini Iyer
    title: 'Veeranam tank water levels critically low — water supply disruptions expected',
    description: 'The water level at Veeranam tank has plummeted to just 29% of its total storage capacity. Due to the delayed release of water from the Mettur dam, metro water supply disruptions are highly likely in several parts of Chennai. Residents are advised to store water and use it conservatively. We need GCC and CMWSSB to arrange emergency tanker services for affected blocks.',
    category_id: 'e0000000-0000-0000-0000-000000000003', // Water Leakage
    severity: 'high',
    status: 'submitted',
    city_id: CHENNAI,
    latitude: 13.0400,
    longitude: 80.2400,
    address: 'Veeranam Pipeline Grid, Chennai',
    ward: 'Ward Officer, Chromepet Zone',
    created_at: '2026-06-28T08:30:00+05:30',
    updated_at: '2026-06-28T08:30:00+05:30'
  }
];

// Timeline events
const timelines = [
  {
    id: '15510000-0000-0000-0000-000000000001',
    issue_id: '15500000-0000-0000-0001-000000000001',
    actor_id: 'f0000000-0000-0000-0001-000000000003',
    previous_status: null,
    new_status: 'community_verification_pending',
    note: 'Issue reported and awaiting community confirmations.',
    created_at: '2026-06-25T15:45:00+05:30'
  },
  {
    id: '15510000-0000-0000-0000-000000000002',
    issue_id: '15500000-0000-0000-0001-000000000002',
    actor_id: 'f0000000-0000-0000-0004-000000000005',
    previous_status: null,
    new_status: 'submitted',
    note: 'Issue submitted to the platform.',
    created_at: '2026-06-28T08:30:00+05:30'
  }
];

// Supports
const supports = [
  { user_id: 'f0000000-0000-0000-0002-000000000001', discussion_id: 'd1500000-0000-0000-0001-000000000001', issue_id: null },
  { user_id: 'f0000000-0000-0000-0002-000000000005', discussion_id: 'd1500000-0000-0000-0001-000000000001', issue_id: null },
  { user_id: 'f0000000-0000-0000-0002-000000000002', discussion_id: 'd1500000-0000-0000-0001-000000000002', issue_id: null },
  { user_id: 'f0000000-0000-0000-0001-000000000001', discussion_id: 'd1500000-0000-0000-0001-000000000003', issue_id: null },
  { user_id: 'f0000000-0000-0000-0001-000000000006', discussion_id: 'd1500000-0000-0000-0001-000000000003', issue_id: null },
  { user_id: 'f0000000-0000-0000-0003-000000000003', discussion_id: 'd1500000-0000-0000-0001-000000000004', issue_id: null },
  { user_id: 'f0000000-0000-0000-0004-000000000003', discussion_id: 'd1500000-0000-0000-0001-000000000005', issue_id: null },
  { user_id: 'f0000000-0000-0000-0005-000000000002', discussion_id: 'd1500000-0000-0000-0001-000000000006', issue_id: null },
  { user_id: 'f0000000-0000-0000-0005-000000000003', discussion_id: 'd1500000-0000-0000-0001-000000000006', issue_id: null },
  { user_id: 'f0000000-0000-0000-0001-000000000004', discussion_id: null, issue_id: '15500000-0000-0000-0001-000000000001' },
  { user_id: 'f0000000-0000-0000-0001-000000000005', discussion_id: null, issue_id: '15500000-0000-0000-0001-000000000001' },
  { user_id: 'f0000000-0000-0000-0004-000000000006', discussion_id: null, issue_id: '15500000-0000-0000-0001-000000000002' }
];

// Confirmations
const confirmations = [
  { user_id: 'f0000000-0000-0000-0001-000000000001', issue_id: '15500000-0000-0000-0001-000000000001', confirmation_type: 'existence', created_at: '2026-06-25T16:30:00+05:30' },
  { user_id: 'f0000000-0000-0000-0001-000000000006', issue_id: '15500000-0000-0000-0001-000000000001', confirmation_type: 'existence', created_at: '2026-06-25T17:15:00+05:30' }
];

// Comments
const comments = [
  { author_id: 'f0000000-0000-0000-0002-000000000003', discussion_id: 'd1500000-0000-0000-0001-000000000001', issue_id: null, content: 'This is a systemic failure. The testing agency has been acting like a black box for far too long. We need transparency, independent tech audits, and decentralization of exams.', created_at: '2026-06-22T12:00:00+05:30' },
  { author_id: 'f0000000-0000-0000-0001-000000000006', discussion_id: null, issue_id: '15500000-0000-0000-0001-000000000001', content: 'I had to drive through Ambedkar Road yesterday and the waterlogging was terrible. You literally cannot see where the road ends and the open drain starts. BMC must patch this now!', created_at: '2026-06-25T18:00:00+05:30' }
];

async function run() {
  console.log('--- SEEDING AUTH USERS SECURELY VIA JS ---');

  for (const auth of authorities) {
    console.log(`Setting up user: ${auth.email}...`);

    // Clean delete to avoid duplicates in auth.users (cascades to profiles & authorities)
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

    // Update the profile row (which is auto-created via database triggers upon user creation)
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

    // Insert authority row
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

  console.log('--- SEEDING CIVIC DISCUSSIONS ---');
  for (const disc of discussions) {
    console.log(`Inserting discussion: ${disc.id}...`);
    const { error } = await supabase.from('discussions').upsert(disc);
    if (error) console.error(`  Error:`, error.message);
  }

  console.log('--- SEEDING CRITICAL ISSUE REPORTS ---');
  for (const issue of issues) {
    console.log(`Inserting issue report: ${issue.title.substring(0, 30)}...`);
    const { error } = await supabase.from('issue_reports').upsert(issue);
    if (error) console.error(`  Error:`, error.message);
  }

  console.log('--- SEEDING TIMELINES ---');
  for (const tl of timelines) {
    console.log(`Inserting timeline: ${tl.id}...`);
    const { error } = await supabase.from('issue_timeline').upsert(tl);
    if (error) console.error(`  Error:`, error.message);
  }

  console.log('--- SEEDING INTERACTIVE ENGAGEMENT ---');
  for (const supp of supports) {
    const { error } = await supabase.from('supports').insert(supp);
    if (error && !error.message.includes('duplicate')) {
      console.error(`  Error inserting support:`, error.message);
    }
  }

  for (const conf of confirmations) {
    const { error } = await supabase.from('confirmations').insert(conf);
    if (error && !error.message.includes('duplicate')) {
      console.error(`  Error inserting confirmation:`, error.message);
    }
  }

  for (const comm of comments) {
    const { error } = await supabase.from('comments').insert(comm);
    if (error && !error.message.includes('duplicate')) {
      console.error(`  Error inserting comment:`, error.message);
    }
  }

  console.log('--- UPDATING COUNTS AND SCORES ---');
  // Manual trigger synchronization to finalize score statistics
  for (const disc of discussions) {
    const { error } = await supabase.rpc('sync_discussion_counts', { disc_id: disc.id });
    if (error) {
      // Fallback update in case RPC doesn't exist
      await supabase.from('discussions').update({
        support_count: supabase.from('supports').select('*', { count: 'exact', head: true }).eq('discussion_id', disc.id),
        comment_count: supabase.from('comments').select('*', { count: 'exact', head: true }).eq('discussion_id', disc.id)
      }).eq('id', disc.id);
    }
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

run().catch(console.error);
