# Building a Release Build in Xcode (TestFlight-like)

To test your app the same way it runs in TestFlight, you need to build a **Release** build with an embedded JavaScript bundle (not using Metro bundler).

## Step 1: Build the JavaScript Bundle

First, create a production JavaScript bundle that will be embedded in the app:

```bash
# From your project root
npx expo export --platform ios --output-dir ./ios-build
```

Or if you're using EAS:

```bash
npx eas build --platform ios --profile preview --local
```

## Step 2: Configure Xcode for Release Build

1. **Open your project in Xcode:**
   ```bash
   open ios/cleanswift.xcworkspace
   ```
   (Use `.xcworkspace`, not `.xcodeproj`)

2. **Select the Release Scheme:**
   - At the top of Xcode, click the scheme selector (next to the play/stop buttons)
   - Select your app scheme (e.g., "cleanswift")
   - Click "Edit Scheme..."
   - Under "Run" → "Info" → "Build Configuration", select **"Release"**
   - Click "Close"

3. **Select a Physical Device or Generic iOS Device:**
   - In the device selector (next to the scheme), choose:
     - A connected physical iPhone/iPad, OR
     - "Any iOS Device (arm64)" for a generic build

   ⚠️ **Important:** You cannot run Release builds on the iOS Simulator. You need a physical device.

## Step 3: Build and Run

1. **Product → Archive** (or press `Cmd + Shift + B` to build, then `Cmd + Shift + A` for archive)
   - This creates a Release build
   - The JS bundle will be embedded in the app (no Metro needed)

2. **Or Build and Run directly:**
   - Press `Cmd + R` or click the Play button
   - Xcode will build a Release version and install it on your device

## Step 4: Verify It's Working

- The app should launch without needing Metro bundler running
- The splash screen should hide after the app initializes
- Check Xcode console for logs (View → Debug Area → Activate Console)

## Troubleshooting

### "No script URL provided" Error
- This means you're trying to run a Debug build without Metro
- Make sure you selected "Release" in the scheme settings

### App Stuck on Splash Screen
- Check Xcode console for errors
- Look for JavaScript errors or initialization failures
- The splash screen should hide after 3 seconds maximum (fallback timer)

### Build Errors
- Clean build folder: `Product → Clean Build Folder` (Cmd + Shift + K)
- Delete derived data: `File → Project Settings → Derived Data → Delete`
- Rebuild: `npx expo prebuild --clean --platform ios`

## Alternative: Use EAS Build for Local Testing

If Xcode Release builds are problematic, use EAS to create a local build:

```bash
# Build locally (faster, no cloud)
npx eas build --platform ios --profile preview --local

# Or build in the cloud (slower, but more reliable)
npx eas build --platform ios --profile preview
```

Then install the `.ipa` file on your device using:
- Xcode → Window → Devices and Simulators
- Drag the `.ipa` file to your device

## Key Differences: Debug vs Release

| Debug Build | Release Build (TestFlight-like) |
|------------|--------------------------------|
| Uses Metro bundler | Embedded JS bundle |
| Slower startup | Faster startup |
| More verbose logs | Optimized/minified code |
| Can run on Simulator | Requires physical device |
| Hot reload works | No hot reload |

For TestFlight testing, always use Release builds!
