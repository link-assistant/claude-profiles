#!/bin/bash

# Test script to demonstrate selective watching with --skip-projects
# This creates a test environment and shows which directories are being watched

echo "🧪 Testing selective watch mode functionality"
echo "============================================="
echo ""

# Create test directory structure
TEST_DIR="/tmp/claude-watch-test-$(date +%s)"
echo "Setting up test environment in: $TEST_DIR"
mkdir -p "$TEST_DIR"

# Simulate a .claude directory structure
mkdir -p "$TEST_DIR/.claude"
mkdir -p "$TEST_DIR/.claude/projects"
mkdir -p "$TEST_DIR/.claude/ide"
mkdir -p "$TEST_DIR/.claude/statsig"
mkdir -p "$TEST_DIR/.claude/todos"
mkdir -p "$TEST_DIR/.claude/subdir/.claude"  # Nested .claude (problematic)
mkdir -p "$TEST_DIR/.claude/plugins"

# Create some test files
echo '{"config": "test"}' > "$TEST_DIR/.claude.json"
echo '{"backup": true}' > "$TEST_DIR/.claude.json.backup"
echo '{"settings": "test"}' > "$TEST_DIR/.claude/settings.json"
echo '{"project": "test"}' > "$TEST_DIR/.claude/projects/test-project.json"
echo '{"lock": "test"}' > "$TEST_DIR/.claude/ide/lock.json"
echo '{"nested": "bad"}' > "$TEST_DIR/.claude/subdir/.claude/config.json"

# Show directory structure
echo ""
echo "📁 Test directory structure:"
find "$TEST_DIR" -type f | sort | sed 's|^'$TEST_DIR'|.|'

echo ""
echo "Now you can test the watch functionality:"
echo ""
echo "1. Test WITHOUT --skip-projects:"
echo "   HOME=\"$TEST_DIR\" node $PWD/claude-profiles.mjs --watch test-profile --verbose"
echo ""
echo "2. Test WITH --skip-projects:"
echo "   HOME=\"$TEST_DIR\" node $PWD/claude-profiles.mjs --watch test-profile --skip-projects --verbose"
echo ""
echo "Expected behavior:"
echo "- Without --skip-projects: Should watch projects folder"
echo "- With --skip-projects: Should skip projects folder (fewer watchers)"
echo "- Both modes should skip nested .claude directories"
echo ""
echo "Look for debug messages showing which directories are being watched."
echo ""
echo "To clean up after testing: rm -rf \"$TEST_DIR\""