# How to Update Your TestFlight App

## Quick Update (One Command)

```bash
eas build --platform ios --profile production --auto-submit
```

This will:
1. ✅ Automatically increment the build number (you have `autoIncrement: true`)
2. ✅ Build your app with the latest code
3. ✅ Upload and submit to TestFlight automatically

## Step-by-Step Update

### Step 1: Build the New Version

```bash
eas build --platform ios --profile production
```

**What happens:**
- EAS automatically increments your build number (currently set to auto-increment)
- Builds your app with all your latest code changes
- Build takes ~10-20 minutes

### Step 2: Submit to TestFlight

Once the build completes:

```bash
eas submit --platform ios --latest
```

**OR** if you already built with `--auto-submit`, it's already submitted!

## Version vs Build Number

- **Version** (`1.0.0` in app.json): User-facing version (only change for major updates)
- **Build Number**: Auto-incremented by EAS (you have `autoIncrement: true` in eas.json)

You typically **don't need to change the version** for TestFlight updates - just build and submit!

## After Building & Submitting

1. **Wait for processing** (5-30 minutes)
   - EAS uploads to App Store Connect
   - Apple processes the build
   
2. **Check TestFlight:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Select your app → **TestFlight** tab
   - New build appears in **iOS Builds**
   - Status changes from "Processing" → "Ready to Test"

3. **Assign to Testers:**
   - If you have an Internal Testing group set up, you can assign the new build
   - Testers will see an update available in TestFlight

## Update Checklist

Before updating:

- [ ] Commit your code changes to git
- [ ] Test locally if possible
- [ ] Verify environment variables are set (`node scripts/check-eas-secrets.js`)

Then:

- [ ] Run build command
- [ ] Wait for build to complete
- [ ] Submit to TestFlight (or use `--auto-submit`)
- [ ] Wait for processing
- [ ] Verify in App Store Connect

## Common Scenarios

### Just Code Changes (Like Your App.tsx Updates)

```bash
# One command - build and submit
eas build --platform ios --profile production --auto-submit
```

No need to change version or build number - EAS handles it!

### Want to Update Version Number

If you want to change the user-facing version:

1. Edit `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1",  // Update this
       ...
     }
   }
   ```

2. Build and submit:
   ```bash
   eas build --platform ios --profile production --auto-submit
   ```

### Check What Build Number You're On

```bash
eas build:list --platform ios --limit 1
```

This shows your latest build number.

## Quick Reference

```bash
# Update TestFlight (recommended)
eas build --platform ios --profile production --auto-submit

# Build only
eas build --platform ios --profile production

# Submit latest build
eas submit --platform ios --latest

# Check recent builds
eas build:list --platform ios --limit 5
```

## Troubleshooting

**Build failed?**
- Check build logs in EAS dashboard
- Verify environment variables are set
- Make sure you're logged in: `eas whoami`

**Submission failed?**
- Check authentication: `eas login`
- Verify App Store Connect access
- Try manual submission in App Store Connect dashboard

**Build number not incrementing?**
- Check that `autoIncrement: true` is in your `eas.json` production profile
- It's already set, so this should work automatically!

## Pro Tips

1. **Use `--auto-submit`** - Saves you a step!
2. **Monitor builds** - Check EAS dashboard for progress
3. **Test internally first** - Always test in TestFlight before App Store
4. **Keep git in sync** - Commit changes before building


