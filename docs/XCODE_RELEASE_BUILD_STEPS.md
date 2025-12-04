# Step-by-Step: Build Release in Xcode (Like TestFlight)

## Step 1: Open Xcode
✅ I just opened Xcode for you. You should see the project open.

## Step 2: Change Build Configuration to Release

1. **Look at the top toolbar** in Xcode (where the Play ▶️ and Stop ⏹ buttons are)
2. **Find the scheme selector** - it's a dropdown that probably says "cleanswift" or shows a device name
3. **Click on it** to open the dropdown
4. **Click "Edit Scheme..."** (at the bottom of the dropdown menu)

   ![Visual Guide]
   Scheme Dropdown → Edit Scheme... → Opens a window

5. **In the window that opens:**
   - On the left sidebar, make sure **"Run"** is selected (it should be by default)
   - On the right side, find **"Build Configuration"**
   - Click the dropdown next to "Build Configuration"
   - Change it from **"Debug"** to **"Release"**
   - Click **"Close"** button at the bottom

## Step 3: Select a Physical Device

1. **Look at the device selector** - it's right next to the scheme selector at the top
2. **Click on it** - you'll see a list of devices
3. **Choose one of these:**
   - A connected iPhone/iPad (if you have one plugged in via USB)
   - OR **"Any iOS Device (arm64)"** (this works for building, but you can't run it)
   
   ⚠️ **IMPORTANT:** You CANNOT run Release builds on the iOS Simulator. You need a real device.

## Step 4: Build and Run

1. **Make sure your iPhone/iPad is connected** via USB and unlocked
2. **Trust the computer** on your device if prompted
3. **Press `Cmd + R`** (Command + R) OR click the **Play ▶️ button** at the top
4. **Wait for the build** - this will take a few minutes the first time
5. **The app will install and launch** on your device automatically

## Step 5: Check the Console for Errors

If the app is stuck on the splash screen:

1. **In Xcode, look at the bottom panel** (if you don't see it, go to: **View → Debug Area → Activate Console**)
2. **Look for these messages:**
   - `=== App.tsx rendering ===` ✅ Good - app is starting
   - `NavigationContainer ready` ✅ Good - navigation loaded
   - `Hiding splash screen` ✅ Good - splash should hide
   - Any red error messages ❌ Bad - these are the problem

3. **Copy any errors** and share them with me

## Troubleshooting

### "No script URL provided" Error
- This means you're still in Debug mode
- Go back to Step 2 and make sure "Release" is selected

### "Code signing error"
- You need to set up code signing in Xcode:
  - Click on "cleanswift" project in the left sidebar
  - Select the "cleanswift" target
  - Go to "Signing & Capabilities" tab
  - Check "Automatically manage signing"
  - Select your Apple Developer Team

### App builds but crashes immediately
- Check the console (Step 5) for error messages
- Common issues: missing environment variables, database connection errors

### Can't find "Edit Scheme"
- The scheme selector is at the very top of Xcode, next to the Play button
- It might be collapsed - try clicking around the top toolbar area

## What This Does

- **Debug Build** = Uses Metro bundler, slower, for development
- **Release Build** = Embedded JS bundle, faster, same as TestFlight ✅

By building in Release mode, you're testing exactly how the app will run in TestFlight!
