#!/bin/bash

# Script to set EAS environment variables
# Usage: ./scripts/set-eas-secrets.sh

echo "🔐 Setting EAS Environment Variables..."
echo ""
echo "⚠️  Make sure you have your values ready:"
echo "   - Supabase URL and Anon Key"
echo "   - Stripe Publishable Key"
echo "   - Google Maps API Key"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Supabase URL
read -p "Enter EXPO_PUBLIC_SUPABASE_URL: " SUPABASE_URL
if [ ! -z "$SUPABASE_URL" ]; then
  eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "$SUPABASE_URL" --scope project
  echo "✅ Set EXPO_PUBLIC_SUPABASE_URL"
fi
echo ""

# Supabase Anon Key
read -p "Enter EXPO_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
if [ ! -z "$SUPABASE_ANON_KEY" ]; then
  eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "$SUPABASE_ANON_KEY" --scope project
  echo "✅ Set EXPO_PUBLIC_SUPABASE_ANON_KEY"
fi
echo ""

# Stripe Key
read -p "Enter EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: " STRIPE_KEY
if [ ! -z "$STRIPE_KEY" ]; then
  eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "$STRIPE_KEY" --scope project
  echo "✅ Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"
fi
echo ""

# Google Maps Key
read -p "Enter EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: " GOOGLE_KEY
if [ ! -z "$GOOGLE_KEY" ]; then
  eas env:create --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "$GOOGLE_KEY" --scope project
  echo "✅ Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
fi
echo ""

echo "🎉 Done! Verify with: node scripts/check-eas-secrets.js"
