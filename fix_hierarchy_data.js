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
  auth: { autoRefreshToken: false, persistSession: false }
});

// =============================================
// STEP 1: Fix NULL assigned_department_id on existing issues
// =============================================
async function fixNullDepartments() {
  console.log('\n=== STEP 1: Fix NULL assigned_department_id on existing issues ===');

  // "Urgent Cleanup Needed" - Mumbai - assign to Waste Management (d0000000-0000-0000-0001-000000000004)
  const { data: issue1 } = await supabase
    .from('issue_reports')
    .update({ assigned_department_id: 'd0000000-0000-0000-0001-000000000004' })
    .eq('title', 'Urgent Cleanup Needed')
    .is('assigned_department_id', null)
    .select('id, title');
  console.log('Fixed "Urgent Cleanup Needed":', issue1);

  // "Open manhole near King's Circle..." - Mumbai - assign to Drainage (d0000000-0000-0000-0001-000000000005)
  const { data: issue2 } = await supabase
    .from('issue_reports')
    .update({ assigned_department_id: 'd0000000-0000-0000-0001-000000000005' })
    .eq('id', '15500000-0000-0000-0001-000000000001')
    .is('assigned_department_id', null)
    .select('id, title');
  console.log('Fixed "Open manhole near King\'s Circle":', issue2);

  // "Veeranam tank water levels critically low" - Chennai - assign to Water Supply (d0000000-0000-0000-0004-000000000003)
  const { data: issue3 } = await supabase
    .from('issue_reports')
    .update({ assigned_department_id: 'd0000000-0000-0000-0004-000000000003' })
    .eq('id', '15500000-0000-0000-0001-000000000002')
    .is('assigned_department_id', null)
    .select('id, title');
  console.log('Fixed "Veeranam tank water levels":', issue3);
}

// =============================================
// STEP 2: Seed Pune city issues (5 issues, one per department)
// =============================================
async function seedPuneIssues() {
  console.log('\n=== STEP 2: Seed Pune city issues ===');

  const PUNE = 'c0000000-0000-0000-0000-000000000006';
  // Use existing Pune citizens as authors - since Pune has no citizens seeded,
  // we'll use the first citizen from any city as author (the issue is linked via city_id anyway)
  const AUTHOR = 'f0000000-0000-0000-0001-000000000001'; // Mumbai citizen

  const puneIssues = [
    {
      id: '15500000-0000-0000-0006-000000000001',
      author_id: AUTHOR,
      title: 'Potholes on FC Road near Fergusson College — multiple two-wheeler accidents reported',
      description: 'Large potholes have formed on Fergusson College Road near Deccan Gymkhana, causing multiple two-wheeler accidents in the past week. The road surface has completely deteriorated after recent rains. PMC Road Department must resurface this stretch immediately.',
      category_id: 'e0000000-0000-0000-0000-000000000001', // Potholes
      severity: 'critical',
      status: 'in_progress',
      city_id: PUNE,
      latitude: 18.5196,
      longitude: 73.8403,
      address: 'Fergusson College Road, Deccan Gymkhana, Pune',
      ward: 'Ward 16 - Shivajinagar',
      assigned_department_id: 'd0000000-0000-0000-0006-000000000001' // Road
    },
    {
      id: '15500000-0000-0000-0006-000000000002',
      author_id: AUTHOR,
      title: 'Streetlights non-functional on Sinhagad Road for over two weeks',
      description: 'Over 30 streetlights on the Sinhagad Road stretch from Vadgaon to Dhayari are completely non-functional, making the road extremely dangerous at night. Multiple residents have reported near-miss incidents with stray animals. PMC Electricity Department must restore lighting immediately.',
      category_id: 'e0000000-0000-0000-0000-000000000004', // Streetlight
      severity: 'high',
      status: 'submitted',
      city_id: PUNE,
      latitude: 18.4650,
      longitude: 73.8170,
      address: 'Sinhagad Road, Vadgaon Budruk, Pune',
      ward: 'Ward 42 - Kothrud',
      assigned_department_id: 'd0000000-0000-0000-0006-000000000002' // Electricity
    },
    {
      id: '15500000-0000-0000-0006-000000000003',
      author_id: AUTHOR,
      title: 'Water supply disruption in Hadapsar — no water for 3 consecutive days',
      description: 'Residents of Hadapsar Gadital area have not received piped water supply for 3 consecutive days. The PMC tanker service is unreliable and does not cover interior lanes. The water pipeline burst near Magarpatta City remains unrepaired. Immediate attention from PMC Water Supply Department needed.',
      category_id: 'e0000000-0000-0000-0000-000000000003', // Water Leakage
      severity: 'critical',
      status: 'seen_by_authority',
      city_id: PUNE,
      latitude: 18.5089,
      longitude: 73.9259,
      address: 'Hadapsar Gadital, near Magarpatta City, Pune',
      ward: 'Ward 35 - Hadapsar',
      assigned_department_id: 'd0000000-0000-0000-0006-000000000003' // Water
    },
    {
      id: '15500000-0000-0000-0006-000000000004',
      author_id: AUTHOR,
      title: 'Garbage pile-up at Katraj Chowk — garbage bins overflowing for a week',
      description: 'Municipal garbage bins at Katraj Chowk have been overflowing for over a week. The stench has become unbearable for nearby shop owners and pedestrians. Stray dogs and rats are scavenging openly. PMC Waste Management must deploy collection trucks immediately and increase frequency for this area.',
      category_id: 'e0000000-0000-0000-0000-000000000002', // Garbage
      severity: 'medium',
      status: 'community_verified',
      city_id: PUNE,
      latitude: 18.4575,
      longitude: 73.8678,
      address: 'Katraj Chowk, Pune',
      ward: 'Ward 38 - Dhankawadi',
      assigned_department_id: 'd0000000-0000-0000-0006-000000000004' // Waste Mgmt
    },
    {
      id: '15500000-0000-0000-0006-000000000005',
      author_id: AUTHOR,
      title: 'Severe waterlogging near Kothrud Depot after every rainfall',
      description: 'The area around Kothrud Depot and Paud Road intersection floods severely after every moderate rainfall due to blocked storm water drains. Commuters are stranded for hours. The drainage system has not been cleaned since last monsoon. PMC Drainage Department must clear the blockages and upgrade the drainage capacity.',
      category_id: 'e0000000-0000-0000-0000-000000000006', // Drainage
      severity: 'high',
      status: 'resolved_by_authority',
      city_id: PUNE,
      latitude: 18.5074,
      longitude: 73.8077,
      address: 'Kothrud Depot, Paud Road, Pune',
      ward: 'Ward 42 - Kothrud',
      assigned_department_id: 'd0000000-0000-0000-0006-000000000005' // Drainage
    }
  ];

  for (const issue of puneIssues) {
    const { error } = await supabase.from('issue_reports').upsert(issue);
    if (error) {
      console.error(`  Error inserting Pune issue "${issue.title}":`, error.message);
    } else {
      console.log(`  ✓ Inserted: "${issue.title}"`);
    }
  }
}

// =============================================
// STEP 3: Add a few more issues to under-represented departments
// across other cities (electricity, water, etc. that have 0)
// =============================================
async function seedAdditionalCityIssues() {
  console.log('\n=== STEP 3: Seed additional issues for under-represented departments ===');

  const AUTHOR = 'f0000000-0000-0000-0001-000000000001';

  const additionalIssues = [
    // Mumbai - Electricity (currently 0 issues)
    {
      id: '15500000-0000-0000-0001-000000000010',
      author_id: 'f0000000-0000-0000-0001-000000000002',
      title: 'Frequent power cuts in Bandra West — transformer overload suspected',
      description: 'Bandra West residents are experiencing 4-5 power cuts daily lasting 30-60 minutes each. The local transformer near Hill Road is visibly overloaded and sparking. BEST Electricity Department must upgrade the transformer and stabilize the grid.',
      category_id: 'e0000000-0000-0000-0000-000000000004',
      severity: 'high',
      status: 'in_progress',
      city_id: 'c0000000-0000-0000-0000-000000000001',
      latitude: 19.0544, longitude: 72.8353,
      address: 'Hill Road, Bandra West, Mumbai',
      ward: 'Ward H-West',
      assigned_department_id: 'd0000000-0000-0000-0001-000000000002' // Mumbai Electricity
    },
    // Mumbai - Water Supply (currently 0 issues)
    {
      id: '15500000-0000-0000-0001-000000000011',
      author_id: 'f0000000-0000-0000-0001-000000000003',
      title: 'Water pipeline burst on SV Road Jogeshwari — wasting thousands of litres daily',
      description: 'A major water main has burst on SV Road near Jogeshwari station causing severe water wastage and road flooding. The leak has persisted for 5 days without BMC Water Supply fixing it.',
      category_id: 'e0000000-0000-0000-0000-000000000003',
      severity: 'critical',
      status: 'submitted',
      city_id: 'c0000000-0000-0000-0000-000000000001',
      latitude: 19.1356, longitude: 72.8490,
      address: 'SV Road, Jogeshwari West, Mumbai',
      ward: 'Ward P-South',
      assigned_department_id: 'd0000000-0000-0000-0001-000000000003' // Mumbai Water
    },
    // Mumbai - Drainage (currently 0 issues — the King's Circle one was just fixed to Drainage above)
    // Delhi - Road (currently 0 issues)
    {
      id: '15500000-0000-0000-0002-000000000010',
      author_id: 'f0000000-0000-0000-0002-000000000001',
      title: 'Broken road divider on Ring Road near AIIMS — causing head-on collision risk',
      description: 'A 50-meter stretch of the central road divider on Ring Road near AIIMS has collapsed, allowing vehicles to cross into oncoming traffic. Two minor accidents already reported this week.',
      category_id: 'e0000000-0000-0000-0000-000000000001',
      severity: 'critical',
      status: 'in_progress',
      city_id: 'c0000000-0000-0000-0000-000000000002',
      latitude: 28.5672, longitude: 77.2100,
      address: 'Ring Road, near AIIMS, New Delhi',
      ward: 'Ward 180S',
      assigned_department_id: 'd0000000-0000-0000-0002-000000000001' // Delhi Road
    },
    // Bengaluru - Water (currently 0 issues)
    {
      id: '15500000-0000-0000-0003-000000000010',
      author_id: 'f0000000-0000-0000-0003-000000000001',
      title: 'BWSSB water supply contaminated in Whitefield — yellowish water from taps',
      description: 'Residents of Whitefield ITPL Main Road area are receiving contaminated yellowish water from BWSSB supply for the past week. Several children have reported stomach infections. BWSSB must test and treat the water supply immediately.',
      category_id: 'e0000000-0000-0000-0000-000000000003',
      severity: 'high',
      status: 'community_verified',
      city_id: 'c0000000-0000-0000-0000-000000000003',
      latitude: 12.9698, longitude: 77.7500,
      address: 'ITPL Main Road, Whitefield, Bengaluru',
      ward: 'Ward 84',
      assigned_department_id: 'd0000000-0000-0000-0003-000000000003' // Bengaluru Water
    },
    // Hyderabad - Road (currently 0 issues)
    {
      id: '15500000-0000-0000-0005-000000000010',
      author_id: 'f0000000-0000-0000-0005-000000000001',
      title: 'Massive potholes on Begumpet flyover approach road',
      description: 'The approach road to Begumpet flyover has developed massive potholes causing traffic snarls and vehicle damage. Multiple car tyre bursts reported daily. GHMC Roads must resurface urgently.',
      category_id: 'e0000000-0000-0000-0000-000000000001',
      severity: 'high',
      status: 'seen_by_authority',
      city_id: 'c0000000-0000-0000-0000-000000000005',
      latitude: 17.4432, longitude: 78.4637,
      address: 'Begumpet Flyover Approach Road, Hyderabad',
      ward: 'Ward 67',
      assigned_department_id: 'd0000000-0000-0000-0005-000000000001' // Hyderabad Road
    }
  ];

  for (const issue of additionalIssues) {
    const { error } = await supabase.from('issue_reports').upsert(issue);
    if (error) {
      console.error(`  Error inserting "${issue.title}":`, error.message);
    } else {
      console.log(`  ✓ Inserted: "${issue.title}"`);
    }
  }
}

// =============================================
// STEP 4: Verify hierarchy end-to-end
// =============================================
async function verifyHierarchy() {
  console.log('\n=== STEP 4: Verify hierarchy end-to-end ===');

  const { data: cities } = await supabase.from('cities').select('id, name, state_id');
  const { data: states } = await supabase.from('states').select('id, name');
  const { data: departments } = await supabase.from('departments').select('id, name, city_id');
  const { data: issues } = await supabase.from('issue_reports').select('id, city_id, assigned_department_id, status');

  const stateMap = {};
  states.forEach(s => stateMap[s.id] = s.name);

  const cityMap = {};
  cities.forEach(c => cityMap[c.id] = { name: c.name, state_id: c.state_id });

  const deptMap = {};
  departments.forEach(d => deptMap[d.id] = { name: d.name, city_id: d.city_id });

  // ---- Department Officer level ----
  console.log('\n--- Department Officer Level ---');
  const deptCounts = {};
  for (const dept of departments) {
    const count = issues.filter(i => i.city_id === dept.city_id && i.assigned_department_id === dept.id).length;
    const resolved = issues.filter(i =>
      i.city_id === dept.city_id &&
      i.assigned_department_id === dept.id &&
      ['closed', 'community_verified_resolution', 'resolved_by_authority'].includes(i.status)
    ).length;
    deptCounts[dept.id] = { total: count, resolved };
    const cityName = cityMap[dept.city_id]?.name || 'Unknown';
    if (count > 0) {
      console.log(`  ${cityName} - ${dept.name}: ${count} total, ${resolved} resolved`);
    }
  }

  // ---- Mayor / City level ----
  console.log('\n--- Mayor / City Level ---');
  const cityCounts = {};
  for (const city of cities) {
    const cityIssues = issues.filter(i => i.city_id === city.id);
    const total = cityIssues.length;
    const resolved = cityIssues.filter(i =>
      ['closed', 'community_verified_resolution', 'resolved_by_authority'].includes(i.status)
    ).length;
    cityCounts[city.id] = { total, resolved };

    // Verify sum of departments equals city total
    const cityDepts = departments.filter(d => d.city_id === city.id);
    const deptSum = cityDepts.reduce((sum, d) => sum + (deptCounts[d.id]?.total || 0), 0);
    const match = deptSum === total ? '✓' : `✗ MISMATCH (dept sum=${deptSum})`;
    console.log(`  ${city.name}: ${total} total, ${resolved} resolved ${match}`);
  }

  // ---- CM / State level ----
  console.log('\n--- CM / State Level ---');
  for (const state of states) {
    const stateCities = cities.filter(c => c.state_id === state.id);
    const stateTotal = stateCities.reduce((sum, c) => sum + (cityCounts[c.id]?.total || 0), 0);
    const stateResolved = stateCities.reduce((sum, c) => sum + (cityCounts[c.id]?.resolved || 0), 0);
    const cityBreakdown = stateCities.map(c => `${c.name}=${cityCounts[c.id]?.total || 0}`).join(' + ');
    console.log(`  ${state.name}: ${stateTotal} total (${cityBreakdown}), ${stateResolved} resolved`);
  }
}

// =============================================
// RUN ALL STEPS
// =============================================
async function main() {
  console.log('==================================================');
  console.log('CivicPlus — Fix Hierarchical Statistics Data');
  console.log('==================================================');

  await fixNullDepartments();
  await seedPuneIssues();
  await seedAdditionalCityIssues();
  await verifyHierarchy();

  console.log('\n==================================================');
  console.log('ALL DONE. Data fix complete.');
  console.log('==================================================');
}

main().catch(console.error);
