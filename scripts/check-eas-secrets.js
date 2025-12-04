#!/usr/bin/env node

/**
 * Script to check if EAS secrets are properly configured
 * Run this before building for production/TestFlight
 */

const { execSync } = require('child_process');

console.log('🔍 Checking EAS Secrets Configuration...\n');

const requiredSecrets = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
];

let allSecretsPresent = true;

try {
  // First check if EAS CLI is installed
  try {
    execSync('eas --version', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    console.error('❌ EAS CLI is not installed!');
    console.log('\n📝 Install it with: npm install -g eas-cli\n');
    process.exit(1);
  }

  // Get list of secrets - try without --json first to see if there's an error
  let output;
  let secrets = [];
  
  try {
    // Try the new command with production environment (eas env:list)
    try {
      output = execSync('eas env:list --environment production --scope project', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (e) {
      // Fall back to old command if new one doesn't work
      try {
        output = execSync('eas secret:list --scope project --json', { 
          encoding: 'utf-8',
          stdio: 'pipe'
        });
      } catch (e2) {
        throw e; // Re-throw the original error
      }
    }
    
    // Try to parse as JSON
    try {
      secrets = JSON.parse(output);
      if (!Array.isArray(secrets)) {
        // If it's not an array, it might be an object with a data property
        if (secrets.data && Array.isArray(secrets.data)) {
          secrets = secrets.data;
        } else {
          throw new Error('Unexpected JSON format');
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, try to parse the text output
      console.log('⚠️  Could not parse JSON output, trying text format...\n');
      
      // Try with production environment (the new command format)
      let textOutput = '';
      try {
        textOutput = execSync('eas env:list --environment production --scope project', { 
          encoding: 'utf-8',
          stdio: 'pipe'
        });
      } catch (e) {
        // Fall back to old command if new one doesn't work
        try {
          textOutput = execSync('eas secret:list --scope project', { 
            encoding: 'utf-8',
            stdio: 'pipe'
          });
        } catch (e2) {
          throw new Error('Could not list secrets. Make sure you are logged in: eas login');
        }
      }
      
      // Parse text output - look for secret names
      const lines = textOutput.split('\n');
      const secretNames = [];
      
      // Check each line for our required secret names
      lines.forEach(line => {
        requiredSecrets.forEach(secretName => {
          // Check if the line contains the secret name (case-insensitive)
          if (line.toLowerCase().includes(secretName.toLowerCase())) {
            // Make sure we don't add duplicates
            if (!secretNames.includes(secretName)) {
              secretNames.push(secretName);
            }
          }
        });
      });
      
      // Also check if the output mentions "no secrets" or similar
      const lowerOutput = textOutput.toLowerCase();
      if (lowerOutput.includes('no environment variables') || 
          lowerOutput.includes('no secrets') ||
          (secretNames.length === 0 && textOutput.trim().length > 0)) {
        // Output exists but no secrets found - this is valid
        secrets = [];
      } else {
        // Create a simple array structure
        secrets = secretNames.map(name => ({ name }));
      }
    }
  } catch (cmdError) {
    // Check if it's an authentication error
    if (cmdError.message.includes('not logged in') || cmdError.message.includes('authentication')) {
      console.error('❌ You are not logged in to EAS!');
      console.log('\n📝 Login with: eas login\n');
      process.exit(1);
    }
    
    // Check if it's a project error
    if (cmdError.message.includes('project') || cmdError.message.includes('not found')) {
      console.error('❌ Could not find EAS project!');
      console.log('\n💡 Make sure you:');
      console.log('   1. Are in the project directory');
      console.log('   2. Have run: eas init (if not already done)');
      console.log('   3. Check your app.json has the correct projectId\n');
      process.exit(1);
    }
    
    // Other errors - show the actual error
    console.error('❌ Error running eas env:list:');
    console.error(cmdError.message);
    console.log('\n💡 Try running manually: eas env:list --scope project\n');
    process.exit(1);
  }
  
  console.log('📋 Current EAS Secrets:\n');
  
  const secretNames = secrets.map(s => s.name || s);
  
  requiredSecrets.forEach(secretName => {
    const exists = secretNames.includes(secretName);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${secretName}`);
    
    if (!exists) {
      allSecretsPresent = false;
    }
  });
  
  console.log('\n');
  
  if (allSecretsPresent) {
    console.log('✅ All required secrets are configured!');
    console.log('✅ You can proceed with building for production.\n');
  } else {
    console.log('❌ Some secrets are missing!');
    console.log('\n📝 To set missing secrets, run:\n');
    
    requiredSecrets.forEach(secretName => {
      if (!secretNames.includes(secretName)) {
        console.log(`   eas env:create --name ${secretName} --value YOUR_VALUE --scope project`);
      }
    });
    
    console.log('\n💡 Tip: Get your values from:');
    console.log('   - Supabase: Project Settings → API');
    console.log('   - Stripe: Dashboard → Developers → API keys');
    console.log('   - Google Maps: Google Cloud Console → APIs & Services → Credentials\n');
    
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Unexpected error:', error.message);
  console.log('\n💡 Make sure you:');
  console.log('   1. Have EAS CLI installed: npm install -g eas-cli');
  console.log('   2. Are logged in: eas login');
  console.log('   3. Are in the project directory');
  console.log('   4. Have initialized EAS: eas init\n');
  process.exit(1);
}
