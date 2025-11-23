# Google Maps API Setup Guide

This guide will help you set up the Google Maps API key needed for address verification and autocomplete features.

## Step 1: Get a Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "CleanSwift")

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable these APIs:
     - ✅ **Geocoding API**
     - ✅ **Places API** (for autocomplete)

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key (it will look like: `AIzaSy...`)

5. **Restrict the API Key (Recommended for Production)**
   - Click on the newly created API key
   - Under "API restrictions", select "Restrict key"
   - Choose only:
     - Geocoding API
     - Places API
   - Under "Application restrictions", you can restrict by:
     - iOS bundle ID: `com.cleanswift.app`
     - Android package name (if you have one)
   - Click "Save"

## Step 2: Add API Key to Your Project

### Option A: Using .env file (Recommended)

1. **Create a `.env` file** in the root of your project (same level as `package.json`)

2. **Add your API key:**
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

   Example:
   ```bash
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   ```

3. **Make sure `.env` is in `.gitignore`** (it should be already)

### Option B: Using app.json (Alternative)

If you prefer to use `app.json`, add it to the `expo` section:

```json
{
  "expo": {
    "extra": {
      "googleMapsApiKey": "your_api_key_here"
    }
  }
}
```

Then update `src/services/googleGeocoding.ts` to read from `expo-constants` instead.

## Step 3: Restart Your Development Server

**IMPORTANT:** After adding the API key, you MUST restart your Expo dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
# or
expo start
```

## Step 4: Verify It's Working

1. Open the app and navigate to the "Plan Your Wash" screen
2. Start typing an address in the "Street Address" field
3. After 3+ characters, you should see autocomplete suggestions appear
4. The error message should disappear

## Troubleshooting

### Error: "Google Maps API key is not configured"
- ✅ Check that `.env` file exists in the project root
- ✅ Check that the variable name is exactly `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- ✅ Make sure you restarted the Expo dev server after adding the key
- ✅ Check the console logs for any environment variable loading messages

### Error: "REQUEST_DENIED" or "API key not valid"
- ✅ Make sure you enabled both Geocoding API and Places API
- ✅ Check that your API key restrictions allow these APIs
- ✅ Verify the API key is correct (no extra spaces or quotes)

### Autocomplete not showing suggestions
- ✅ Make sure Places API is enabled
- ✅ Check browser/device console for API errors
- ✅ Verify you're typing at least 3 characters

### Address verification fails
- ✅ Make sure Geocoding API is enabled
- ✅ Check that the address is in Canada (currently only Canadian addresses are supported)
- ✅ Verify the address format is correct

## Cost Information

Google Maps APIs have a free tier:
- **Geocoding API**: $5 per 1,000 requests (first $200/month free)
- **Places API Autocomplete**: $2.83 per 1,000 requests (first $200/month free)

For most apps, the free tier should be sufficient. Monitor usage in Google Cloud Console.

## Security Notes

- ⚠️ Never commit your `.env` file to git
- ⚠️ The `EXPO_PUBLIC_` prefix makes this key visible in your app bundle
- ⚠️ Always restrict your API key in Google Cloud Console
- ⚠️ For production, consider using a backend proxy to hide the API key

