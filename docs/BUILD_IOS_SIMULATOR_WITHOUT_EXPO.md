# Building and Running on iOS Simulator Without Expo CLI

This guide shows you how to build and run cleanswift on the iOS Simulator using Xcode directly, without using Expo CLI commands.

## Prerequisites

1. **CocoaPods installed** - Already done ✅
2. **Xcode installed** - Required
3. **iOS Simulator available** - Should be installed with Xcode

## Method 1: Using Xcode GUI (Recommended)

### Step 1: Start Metro Bundler

You need Metro bundler running for the JavaScript bundle (even when not using Expo CLI):

```bash
cd /Users/camps/cleanswift
npx expo start --no-dev-client
```

**Keep this terminal window open** - Metro needs to be running for the app to load.

### Step 2: Open Xcode

The workspace should already be open. If not:

```bash
open ios/cleanswift.xcworkspace
```

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file.

### Step 3: Select Simulator

1. In Xcode, look at the top toolbar
2. Click the device selector (next to the Play button)
3. Choose an iOS Simulator (e.g., "iPhone 15 Pro" or any available simulator)

### Step 4: Build and Run

1. Press `Cmd + R` or click the **Play ▶️** button
2. Wait for the build to complete (first build may take a few minutes)
3. The simulator will launch automatically and install the app

### Step 5: Verify Metro Connection

- The app should connect to Metro bundler automatically
- Check the Metro terminal - you should see bundle requests
- If the app shows a red error screen, make sure Metro is running

## Method 2: Using Command Line (xcodebuild)

If you prefer command line:

### Step 1: Start Metro (in background)

```bash
cd /Users/camps/cleanswift
npx expo start --no-dev-client &
```

### Step 2: List Available Simulators

```bash
xcrun simctl list devices available
```

### Step 3: Build and Run

```bash
cd ios
xcodebuild -workspace cleanswift.xcworkspace \
  -scheme cleanswift \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  build

# Then install and launch
xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || true
xcrun simctl install booted /Users/camps/cleanswift/ios/build/Build/Products/Debug-iphonesimulator/cleanswift.app
xcrun simctl launch booted com.cleanswift.app
```

**Note:** Replace "iPhone 15 Pro" with your preferred simulator name from step 2.

## Troubleshooting

### Build Errors

If you see linker errors or build failures:

1. **Clean build folder:**
   ```bash
   cd ios
   xcodebuild clean -workspace cleanswift.xcworkspace -scheme cleanswift
   ```

2. **Reinstall pods:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

3. **Clear derived data:**
   - In Xcode: `File → Project Settings → Derived Data → Delete`

### Metro Connection Issues

- Make sure Metro is running before launching the app
- Check that Metro is listening on the default port (usually 8081)
- The app should automatically connect to `localhost:8081`

### Simulator Not Launching

- Make sure you have at least one iOS Simulator installed
- Check Xcode → Settings → Platforms to ensure iOS simulators are installed
- Try booting the simulator manually: `xcrun simctl boot "iPhone 15 Pro"`

## Key Differences from Expo CLI

- **No `expo run:ios` command** - Using Xcode directly
- **Metro still required** - JavaScript bundle needs Metro for Debug builds
- **Full native build** - Building the actual native iOS app, not Expo Go
- **Xcode debugging** - Can use Xcode's debugger and breakpoints

## For Release Builds (No Metro Required)

If you want to build a Release version that doesn't need Metro:

1. In Xcode: `Product → Scheme → Edit Scheme`
2. Under "Run" → "Info" → "Build Configuration", select **"Release"**
3. Build and run (this embeds the JS bundle in the app)

Note: Release builds cannot run on Simulator - they require a physical device.

