# OAuth Redirect URL Setup - Fixing Localhost Issue

## Problem
After logging in with Google, the app redirects to `localhost` instead of the app, showing "Safari can't open the page because it couldn't connect to the server."

## Root Cause
The deep link redirect URL `cleanswift://auth/callback` is not configured in Supabase's allowed redirect URLs, causing Supabase to default to localhost.

## Solution

### Step 1: Configure Redirect URL in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/nxxjpstkgbyaazmcybsf

2. **Open Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

3. **Add Redirect URL**
   - Scroll to **Redirect URLs** section
   - Click **Add URL** or the **+** button
   - Enter: `cleanswift://auth/callback`
   - Click **Save**

4. **Verify Site URL**
   - Make sure **Site URL** is set (can be any valid URL, e.g., `https://cleanswift.app`)
   - This is required for OAuth to work

### Step 2: Verify Google OAuth Configuration

1. **In Supabase Dashboard**
   - Go to **Authentication** → **Providers**
   - Click on **Google**
   - Ensure it's **Enabled**
   - Verify **Client ID** and **Client Secret** are set

2. **In Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID
   - Under **Authorized redirect URIs**, ensure you have:
     ```
     https://nxxjpstkgbyaazmcybsf.supabase.co/auth/v1/callback
     ```
   - This is the Supabase callback URL that handles the OAuth flow

### Step 3: Test the Flow

1. **Restart your Expo dev server** (important after config changes)
   ```bash
   npx expo start --clear
   ```

2. **Test Google OAuth**
   - Tap "Continue with Google"
   - Complete Google login
   - Should redirect back to app (not localhost)
   - Should show onboarding wizard if profile is incomplete

## How It Works

1. User taps "Continue with Google"
2. App opens Google login in browser via `openAuthSessionAsync`
3. User authenticates with Google
4. Google redirects to Supabase callback: `https://nxxjpstkgbyaazmcybsf.supabase.co/auth/v1/callback`
5. Supabase processes the OAuth code
6. Supabase redirects to: `cleanswift://auth/callback?code=...`
7. App's deep link handler (`OAuthDeepLinkHandler` in `App.tsx`) catches the callback
8. App exchanges the code for a session
9. User is authenticated and navigated appropriately

## Troubleshooting

### Still seeing localhost?
- ✅ Verify `cleanswift://auth/callback` is in Supabase Redirect URLs
- ✅ Restart Expo dev server after adding redirect URL
- ✅ Check console logs for OAuth callback messages
- ✅ Verify the deep link scheme is registered in `app.json` (should be `"scheme": "cleanswift"`)

### Deep link not working?
- Check `app.json` has: `"scheme": "cleanswift"`
- Rebuild the app if you changed `app.json`:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios
  ```

### OAuth callback not received?
- Check console logs in `App.tsx` - should see "OAuth callback received"
- Verify the deep link handler is running (check `OAuthDeepLinkHandler` component)
- Test deep link manually: `xcrun simctl openurl booted "cleanswift://auth/callback?code=test"`

## Code Locations

- **OAuth Handler**: `App.tsx` → `OAuthDeepLinkHandler` component
- **OAuth Initiation**: `src/screens/auth/SignInScreen.tsx` → `handleOAuthSignIn` function
- **Deep Link Scheme**: `app.json` → `"scheme": "cleanswift"`

## Quick Checklist

- [ ] Added `cleanswift://auth/callback` to Supabase Redirect URLs
- [ ] Verified Google OAuth is enabled in Supabase
- [ ] Verified Google Cloud Console has Supabase callback URL
- [ ] Restarted Expo dev server
- [ ] Tested OAuth flow end-to-end
- [ ] Verified deep link handler receives callback

---

**Last Updated:** 2025-01-23
**Status:** Critical fix for OAuth redirect issue

