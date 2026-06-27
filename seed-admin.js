import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

// Service role client bypasses RLS
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Starting administrative seed runner...");
  try {
    // 1. Delete user from auth table to resolve database corruption
    console.log("Removing existing corrupted records from auth database...");
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find(u => u.email === 'admin@civicplus.com');
    if (existing) {
      console.log("Deleting existing user ID:", existing.id);
      await supabase.auth.admin.deleteUser(existing.id);
    }
    
    // Delete profile record
    await supabase.from('profiles').delete().eq('email', 'admin@civicplus.com');

    // 2. Create the admin user cleanly via Supabase Auth Admin API
    console.log("Creating new admin user via Auth Admin API...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@civicplus.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Platform Admin',
        username: 'admin'
      }
    });

    if (createError) {
      throw createError;
    }

    const adminUserId = newUser.user?.id;
    if (!adminUserId) {
      throw new Error("Could not retrieve created user ID.");
    }

    console.log("Admin user created successfully with ID:", adminUserId);

    // 3. Upsert into public.profiles with role: 'admin'
    console.log("Assigning role 'admin' in profiles table...");
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserId,
        full_name: 'Platform Admin',
        username: 'admin',
        email: 'admin@civicplus.com',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'CivicPulse platform systems administrator.',
        contribution_score: 999
      }, { onConflict: 'id' });

    if (profileError) {
      throw profileError;
    }

    console.log("=========================================");
    console.log("Admin account successfully seeded!");
    console.log("Email: admin@civicplus.com");
    console.log("Password: password123");
    console.log("=========================================");
  } catch (err) {
    console.error("Migration failed:", err);
    console.log("\nIf this fails with status 500, please execute the following SQL in your Supabase SQL Editor first to resolve internal database corruption:");
    console.log("DELETE FROM auth.users WHERE email = 'admin@civicplus.com';");
    console.log("DELETE FROM public.profiles WHERE email = 'admin@civicplus.com';");
    console.log("Then run this node script again to complete setup.");
    process.exit(1);
  }
}

run();
