# Device vs Simulator Troubleshooting Guide

## Problem: App Works on Simulator but Not on Physical Device

This is a common issue when building for TestFlight or production. The most likely cause is **missing environment variables** in your EAS build.

## Quick Diagnosis

### Step 1: Check EAS Secrets

Run the diagnostic script:

```bash
node scripts/check-eas-secrets.js
```

This will show you which secrets are missing.

### Step 2: Check Device Logs

If the app is installed on your device, check the logs:

**For iOS:**
```bash
# Connect your iPhone via USB
# Open Console.app on your Mac
# Filter for "cleanswift" or "Expo"
```

Look for these error messages:
- `❌ CRITICAL: Missing Supabase environment variables!`
- `❌ MISSING - Check .env file or EAS secrets`

### Step 3: Visual Indicators

If environment variables are missing, the app will now show a **Configuration Error Screen** with:
- Red alert icon
- List of missing variables
- Step-by-step instructions to fix

## Common Causes

### 1. Missing EAS Secrets (Most Common)

**Symptom:** App loads but nothing works (can't login, can't fetch data, etc.)

**Solution:**
```bash
# 1. Install EAS CLI (if not already)
npm install -g eas-cli

# 2. Login
eas login

# 3. Set all required secrets (use eas env:create, not secret:create)
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_SUPABASE_URL --scope project
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --scope project
eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value YOUR_STRIPE_KEY --scope project
eas env:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value YOUR_GOOGLE_KEY --scope project

# 4. Verify
eas env:list --scope project

# 5. Rebuild
eas build --platform ios --profile production
```

### 2. Wrong Build Profile

**Symptom:** Secrets are set but not being used

**Check:** Make sure you're using the correct build profile. Check `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "@EXPO_PUBLIC_SUPABASE_URL",
        ...
      }
    }
  }
}
```

The `@` prefix tells EAS to use secrets.

### 3. Network/Firewall Issues

**Symptom:** App loads but API calls fail

**Check:**
- Device has internet connection
- Supabase project allows requests from your app
- No corporate firewall blocking requests

### 4. Code Signing Issues

**Symptom:** App won't install or crashes immediately

**Solution:**
- Check Xcode for code signing errors
- Verify provisioning profiles are valid
- Check App Store Connect for build status

## Finding Your Environment Variable Values

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Google Maps
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Copy your API key → `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

## Testing After Fix

1. **Rebuild the app:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Wait for build to complete** (check EAS dashboard)

3. **Install on device:**
   - Download from TestFlight
   - Or install via EAS build URL

4. **Check logs:**
   - Look for `✅ Supabase configured` in logs
   - App should load normally (no error screen)

## Prevention

Add this to your build process:

```bash
# In your CI/CD or before building
node scripts/check-eas-secrets.js || exit 1
```

This will fail the build if secrets are missing.

## Still Not Working?

1. **Check the error screen** - The app now shows a helpful error screen if config is missing
2. **Check device logs** - Look for specific error messages
3. **Compare simulator vs device:**
   - Simulator uses `.env` files (works automatically)
   - Device uses EAS secrets (must be set manually)
4. **Verify build profile** - Make sure you're building with the right profile

## Related Files

- `eas.json` - EAS build configuration
- `scripts/check-eas-secrets.js` - Diagnostic script
- `src/components/ConfigurationErrorScreen.tsx` - Error screen component
- `App.tsx` - App initialization with env var checks
