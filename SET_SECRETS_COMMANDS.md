# Commands to Set EAS Environment Variables

**IMPORTANT:** The new `eas env:create` command requires an `--environment` parameter. You need to set these for each environment you use (production, preview, development).

Run these commands one by one in your terminal:

## For Production Environment:

### 1. Supabase URL
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://nxxjpstkgbyaazmcybsf.supabase.co --environment production --scope project
```

### 2. Supabase Anon Key
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eGpwc3RrZ2J5YWF6bWN5YnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTc2NjgsImV4cCI6MjA3ODg3MzY2OH0.x_iyPwOhvLWrqD1Cm0fHNVqTtIYRLhydbywxQZlfxTU --environment production --scope project
```

### 3. Stripe Publishable Key
```bash
eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_test_51SVhb1GqAAU0pEZpLwHWOmm1TnekPFlL7KWX7apPNhpEefiEa61CpRiv1eVqYr48KCMtn1mtDlYYxDlKvINklFHm00NBY4Ye0H --environment production --scope project
```

### 4. Google Maps API Key
```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value AIzaSy-REDACTED-GOOGLE-MAPS-KEY --environment production --scope project
```

## For Preview Environment (if needed):

Repeat the same commands but replace `--environment production` with `--environment preview`:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://nxxjpstkgbyaazmcybsf.supabase.co --environment preview --scope project
# ... and so on for other variables
```

## After Setting All Secrets

Verify they're set:
```bash
# Check production environment
eas env:list --environment production --scope project

# Or use the script (may need updating)
node scripts/check-eas-secrets.js
```

You should see all your variables listed.

Then rebuild:
```bash
eas build --platform ios --profile production
```

## Note

If you previously ran the commands without `--environment production`, those variables were not set correctly. You need to run them again WITH the `--environment production` parameter.
