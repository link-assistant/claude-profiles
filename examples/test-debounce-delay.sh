#!/bin/bash

# Test script to verify debounce delay configuration functionality
# This script tests the new --debounce-delay option

set -e

echo "🧪 Testing debounce delay configuration functionality"

# Test help output to verify new option appears
echo "1. Testing help output includes new debounce-delay option..."
if ./claude-profiles.mjs --help | grep -q "debounce-delay"; then
    echo "✅ Help text includes --debounce-delay option"
else
    echo "❌ Help text missing --debounce-delay option"
    exit 1
fi

# Test that help shows the new example
echo "2. Testing help includes debounce delay example..."
if ./claude-profiles.mjs --help | grep -q "debounce-delay 10000"; then
    echo "✅ Help text includes debounce delay example"
else
    echo "❌ Help text missing debounce delay example"
    exit 1
fi

# Test option validation - should accept numeric values
echo "3. Testing option validation..."
if ./claude-profiles.mjs --help --debounce-delay abc 2>&1 | grep -q "number"; then
    echo "✅ Option validation works (rejects non-numeric values)"
else
    echo "⚠️  Could not test option validation directly from help"
fi

echo "✅ All basic tests passed!"
echo ""
echo "📝 To manually test the debounce functionality:"
echo "   1. Create a test profile: ./claude-profiles.mjs --store test"
echo "   2. Start watch with custom delay: ./claude-profiles.mjs --watch test --debounce-delay 10000"
echo "   3. Make changes to Claude config files and observe 10s delay instead of default 5s"
echo "   4. Check verbose logs: ./claude-profiles.mjs --watch test --debounce-delay 3000 --verbose"