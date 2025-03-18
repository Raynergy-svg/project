import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dev user details - matching the ones in SignInClient.tsx
const users = [
  {
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    email: 'user@example.com',
    password: 'password123',
    role: 'user'
  }
];

async function createDevUsers() {
  console.log('Creating development users...');

  for (const user of users) {
    try {
      console.log(`\nCreating ${user.role} user...`);
      
      // Create the user
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          role: user.role
        }
      });

      if (createError) {
        console.error(`Error creating ${user.role} user:`, createError.message);
        continue;
      }

      if (!userData.user) {
        console.error(`No user data returned for ${user.role}`);
        continue;
      }

      // For admin user, update the role to service_role
      if (user.role === 'admin') {
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          userData.user.id,
          { role: 'service_role' }
        );

        if (updateError) {
          console.error('Error updating admin role:', updateError.message);
          continue;
        }
      }

      console.log(`✅ ${user.role} user created successfully!`);
      console.log('Email:', user.email);
      console.log('Password:', user.password);
      console.log('User ID:', userData.user.id);
    } catch (error) {
      console.error(`Unexpected error creating ${user.role} user:`, error);
    }
  }
}

// Run the script
createDevUsers(); 