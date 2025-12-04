# Setting Up EAS Secrets for TestFlight Builds

## The Problem

Your app works in Xcode but gets stuck on the splash screen in TestFlight because **environment variables are missing**. 

In Xcode, you might have a `.env` file that works locally, but **TestFlight builds use EAS Build**, which requires secrets to be set separately.

## The Solution: Set EAS Secrets

EAS secrets are environment variables that get injected into your build. You need to set them for your production/preview builds.

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
# or use npx
npx eas-cli login
```

### Step 2: Login to EAS

```bash
eas login
```

### Step 3: Set Your Secrets

Run these commands to set each required environment variable:

```bash
# Supabase URL
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co" --scope project

# Supabase Anon Key
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here" --scope project

# Stripe Publishable Key
eas secret:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_test_..." --scope project

# Google Maps API Key (if you use it)
eas secret:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "AIza..." --scope project

# Test Payment Secret (if you use it)
eas secret:create --name EXPO_PUBLIC_TEST_PAYMENT_SECRET --value "your-secret" --scope project
```

### Step 4: Verify Secrets Are Set

```bash
eas secret:list
```

You should see all your secrets listed.

### Step 5: Rebuild for TestFlight

After setting secrets, rebuild your app:

```bash
eas build --platform ios --profile production
```

Or if you're using the preview profile:

```bash
eas build --platform ios --profile preview
```

## Finding Your Values

### Supabase URL and Key
1. Go to your Supabase project dashboard
2. Go to Settings → API
3. Copy:
   - **Project URL** → Use for `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Stripe Publishable Key
1. Go to Stripe Dashboard
2. Go to Developers → API keys
3. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)

## Quick Check: Verify Your Current Secrets

```bash
eas secret:list
```

If any are missing, add them using the commands above.

## Important Notes

- **Secrets are per-project** - They're tied to your EAS project ID
- **Secrets are encrypted** - They're stored securely by Expo
- **Secrets are injected at build time** - They become environment variables in your app
- **Local `.env` files don't work for EAS builds** - You must use `eas secret:create`

## Troubleshooting

### "Secret already exists"
If you need to update a secret:
```bash
eas secret:delete --name EXPO_PUBLIC_SUPABASE_URL
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "new-value" --scope project
```

### "App still stuck on splash screen"
1. Check that secrets are set: `eas secret:list`
2. Rebuild the app: `eas build --platform ios --profile production`
3. Check Xcode console when running locally in Release mode to see if env vars are loaded

### "How do I know if secrets are being used?"
After setting secrets and rebuilding, check the build logs. You should see the environment variables being injected (they won't show the actual values for security).

## Next Steps

1. ✅ Set all required secrets using `eas secret:create`
2. ✅ Verify with `eas secret:list`
3. ✅ Rebuild: `eas build --platform ios --profile production`
4. ✅ Submit to TestFlight: `eas submit --platform ios`
5. ✅ Test on your phone - the splash screen should now hide!
