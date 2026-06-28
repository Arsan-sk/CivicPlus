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

const supabase = createClient(env['VITE_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const users = [
  // Chief Ministers
  { id: 'df000000-0000-0000-0000-000000000001', email: 'fadnavis@maharashtra.gov.in', name: 'Devendra Fadnavis', username: 'fadnavis_devendra' },
  { id: 'df000000-0000-0000-0000-000000000002', email: 'rekha@delhi.gov.in', name: 'Rekha Gupta', username: 'gupta_rekha' },
  { id: 'df000000-0000-0000-0000-000000000003', email: 'vijay@tamilnadu.gov.in', name: 'C. Joseph Vijay', username: 'vijay_joseph' },
  { id: 'df000000-0000-0000-0000-000000000004', email: 'dk@karnataka.gov.in', name: 'D. K. Shivakumar', username: 'shivakumar_dk' },
  { id: 'df000000-0000-0000-0000-000000000005', email: 'revanth@telangana.gov.in', name: 'A. Revanth Reddy', username: 'revanth_reddy' },
  
  // Citizens - Mumbai
  { id: 'f0000000-0000-0000-0001-000000000001', email: 'abhijeet@civicplus.com', name: 'Abhijeet Dipke', username: 'abhijeet_dipke' },
  { id: 'f0000000-0000-0000-0001-000000000002', email: 'aaditya@civicplus.com', name: 'Aaditya Thackeray', username: 'aaditya_t' },
  { id: 'f0000000-0000-0000-0001-000000000003', email: 'priya.s@civicplus.com', name: 'Priya Sharma', username: 'priya_sharma' },
  { id: 'f0000000-0000-0000-0001-000000000004', email: 'rohan.j@civicplus.com', name: 'Rohan Joshi', username: 'rohan_joshi' },
  { id: 'f0000000-0000-0000-0001-000000000005', email: 'meera.d@civicplus.com', name: 'Meera Deshmukh', username: 'meera_d' },
  { id: 'f0000000-0000-0000-0001-000000000006', email: 'sameer.k@civicplus.com', name: 'Sameer Kulkarni', username: 'sameer_k' },
  
  // Citizens - Delhi
  { id: 'f0000000-0000-0000-0002-000000000001', email: 'dhruv@civicplus.com', name: 'Dhruv Rathee', username: 'dhruv_rathee' },
  { id: 'f0000000-0000-0000-0002-000000000002', email: 'arvind@civicplus.com', name: 'Arvind Kejriwal', username: 'arvind_k' },
  { id: 'f0000000-0000-0000-0002-000000000003', email: 'sunita@civicplus.com', name: 'Sunita Narain', username: 'sunita_n' },
  { id: 'f0000000-0000-0000-0002-000000000004', email: 'vikram.m@civicplus.com', name: 'Vikram Malhotra', username: 'vikram_m' },
  { id: 'f0000000-0000-0000-0002-000000000005', email: 'ananya.p@civicplus.com', name: 'Ananya Panday', username: 'ananya_p' },
  { id: 'f0000000-0000-0000-0002-000000000006', email: 'kabir.s@civicplus.com', name: 'Kabir Singh', username: 'kabir_s' },
  
  // Citizens - Bengaluru
  { id: 'f0000000-0000-0000-0003-000000000001', email: 'khansir@civicplus.com', name: 'Khan Sir', username: 'khan_sir' },
  { id: 'f0000000-0000-0000-0003-000000000002', email: 'nandan@civicplus.com', name: 'Nandan Nilekani', username: 'nandan_n' },
  { id: 'f0000000-0000-0000-0003-000000000003', email: 'sudha@civicplus.com', name: 'Sudha Murthy', username: 'sudha_m' },
  { id: 'f0000000-0000-0000-0003-000000000004', email: 'karthik.g@civicplus.com', name: 'Karthik Gowda', username: 'karthik_g' },
  { id: 'f0000000-0000-0000-0003-000000000005', email: 'divya.s@civicplus.com', name: 'Divya Spandana', username: 'divya_s' },
  { id: 'f0000000-0000-0000-0003-000000000006', email: 'rahul.h@civicplus.com', name: 'Rahul Hegde', username: 'rahul_h' },
  
  // Citizens - Chennai
  { id: 'f0000000-0000-0000-0004-000000000001', email: 'stalin@civicplus.com', name: 'M. K. Stalin', username: 'stalin_mk' },
  { id: 'f0000000-0000-0000-0004-000000000002', email: 'kamal@civicplus.com', name: 'Kamal Haasan', username: 'kamal_h' },
  { id: 'f0000000-0000-0000-0004-000000000003', email: 'chinmayi@civicplus.com', name: 'Chinmayi Sripaada', username: 'chinmayi_s' },
  { id: 'f0000000-0000-0000-0004-000000000004', email: 'ramesh.k@civicplus.com', name: 'Ramesh Kumar', username: 'ramesh_k' },
  { id: 'f0000000-0000-0000-0004-000000000005', email: 'shalini.i@civicplus.com', name: 'Shalini Iyer', username: 'shalini_i' },
  { id: 'f0000000-0000-0000-0004-000000000006', email: 'vijay.k@civicplus.com', name: 'Vijay Kumar', username: 'vijay_k' },
  
  // Citizens - Hyderabad
  { id: 'f0000000-0000-0000-0005-000000000001', email: 'ktr@civicplus.com', name: 'K. T. Rama Rao', username: 'ktr_trsp' },
  { id: 'f0000000-0000-0000-0005-000000000002', email: 'samantha@civicplus.com', name: 'Samantha Ruth', username: 'samantha_r' },
  { id: 'f0000000-0000-0000-0005-000000000003', email: 'asad@civicplus.com', name: 'Asaduddin Owaisi', username: 'asad_owaisi' },
  { id: 'f0000000-0000-0000-0005-000000000004', email: 'harsha.v@civicplus.com', name: 'Harsha Vardhan', username: 'harsha_v' },
  { id: 'f0000000-0000-0000-0005-000000000005', email: 'srinivas.r@civicplus.com', name: 'Srinivas Rao', username: 'srinivas_r' },
  { id: 'f0000000-0000-0000-0005-000000000006', email: 'lakshmi.p@civicplus.com', name: 'Lakshmi Prasanna', username: 'lakshmi_p' }
];

async function run() {
  console.log('--- SEEDING AUTH USERS SECURELY ---');
  for (const user of users) {
    console.log(`Creating user: ${user.email} (${user.id})...`);
    // Attempt deletion first to prevent duplicate errors
    await supabase.auth.admin.deleteUser(user.id);
    
    const { data: createData, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        username: user.username
      }
    });

    if (error) {
      console.error(`  Error creating ${user.email}:`, error.message);
    } else {
      console.log(`  Success! Created user ID: ${createData.user.id}`);
    }
  }
  console.log('--- AUTH USER SEEDING COMPLETED ---');
}

run().catch(console.error);
