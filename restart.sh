#!/bin/bash
echo "=== COMPLETE RESTART ==="
echo "1. Killing all processes..."
pkill -9 -f "expo" || true
pkill -9 -f "node" || true
pkill -9 -f "metro" || true
sleep 2

echo "2. Clearing ALL caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

echo "3. Clearing iOS Simulator (if running)..."
xcrun simctl shutdown all 2>/dev/null || true

echo ""
echo "=== DONE ==="
echo "Now run: npx expo start --clear"
echo "Then press 'i' to open iOS simulator"
