/**
 * Script to create the avatars storage bucket
 * Run this with: node scripts/create-avatars-bucket.js
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * You can also create a .env file with these variables
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Get your service role key from: https://supabase.com/dashboard/project/_/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAvatarsBucket() {
  console.log('Creating avatars storage bucket...');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const avatarsBucket = buckets.find(b => b.id === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket already exists');
      return;
    }

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    });

    if (error) {
      throw error;
    }

    console.log('✅ Avatars bucket created successfully');
    console.log('   Bucket ID: avatars');
    console.log('   Public: true');
    console.log('   File size limit: 5MB');
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    process.exit(1);
  }
}

createAvatarsBucket();

