# How to Submit Your App to App Store / TestFlight

## Quick Submit (Recommended)

EAS can automatically build and submit your app in one command:

```bash
eas build --platform ios --profile production --auto-submit
```

This will:
1. Build your app
2. Upload it to App Store Connect
3. Submit it automatically (if configured)

## Step-by-Step: Build Then Submit Separately

### Step 1: Build Your App

```bash
eas build --platform ios --profile production
```

Wait for the build to complete. You'll see a build URL and status.

### Step 2: Submit to App Store Connect

Once your build is complete, submit it:

```bash
eas submit --platform ios --profile production
```

**OR** if you want to submit a specific build:

```bash
eas submit --platform ios --latest
```

## Your Current Configuration

Based on your `eas.json`, you have:

- ✅ **Apple ID**: meherpeeyush@gmail.com
- ✅ **App Store Connect App ID**: 6756033007
- ✅ **Apple Team ID**: CX54B578R9

These are already configured, so submission should work automatically.

## What Happens During Submission

1. **EAS uploads** your `.ipa` file to App Store Connect
2. **App Store Connect processes** the build (5-30 minutes)
3. **Build appears** in TestFlight → iOS Builds
4. **Status shows** "Ready to Test" when processing is complete

## After Submission

### For TestFlight (Internal Testing)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app (CleanSwift)
3. Click **TestFlight** tab
4. Wait for build to show "Ready to Test"
5. Create an **Internal Testing** group (if not already created)
6. Add team members as testers
7. Assign the build to the testing group

### For App Store Submission

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Click **App Store** tab
4. Click **+ Version or Platform**
5. Select your build
6. Fill in required metadata:
   - App description
   - Screenshots
   - Privacy policy URL
   - Support URL
   - etc.
7. Submit for review

## Troubleshooting

### If submission fails:

1. **Check authentication:**
   ```bash
   eas whoami
   ```

2. **Verify App Store Connect access:**
   - Make sure you can log into App Store Connect
   - Verify your Apple ID has the right permissions

3. **Check build status:**
   ```bash
   eas build:list --platform ios --limit 5
   ```

4. **Manual upload (if needed):**
   - Download the `.ipa` from EAS dashboard
   - Upload via Transporter app or Xcode

### Common Issues

**"No builds found"**
- Make sure you've completed a build first
- Check build status: `eas build:list`

**"Authentication failed"**
- Re-authenticate: `eas login`
- Check App Store Connect credentials

**"Build not found"**
- Use `--latest` flag: `eas submit --platform ios --latest`
- Or specify build ID: `eas submit --platform ios --id <build-id>`

## Commands Reference

```bash
# Build and submit in one command
eas build --platform ios --profile production --auto-submit

# Build only
eas build --platform ios --profile production

# Submit latest build
eas submit --platform ios --latest

# Submit specific build
eas submit --platform ios --id <build-id>

# List recent builds
eas build:list --platform ios --limit 5

# Check submission status
# (Check App Store Connect dashboard)
```

## Next Steps After Submission

1. **Wait for processing** (5-30 minutes)
2. **Check TestFlight** for "Ready to Test" status
3. **Set up testing groups** in App Store Connect
4. **Distribute to testers** or submit for App Store review
