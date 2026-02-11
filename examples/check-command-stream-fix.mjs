#!/usr/bin/env node
// Script to check if command-stream JSON quoting issue has been fixed
// Run this periodically to monitor for fix availability

import { execSync } from 'child_process';

console.log('🔍 Checking command-stream JSON quoting issue status...\n');

// Check if we can load command-stream
let commandStreamVersion;
try {
  const { use } = eval(
    await fetch('https://unpkg.com/use-m/use.js').then(r => r.text())
  );
  const [{ $ }] = await Promise.all([
    use('command-stream@latest') // Use latest to check for fixes
  ]);
  
  // Try to get version info
  try {
    const versionInfo = execSync('npm view command-stream version', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    }).trim();
    commandStreamVersion = versionInfo;
    console.log(`📦 Command-stream version: ${commandStreamVersion}`);
  } catch (e) {
    console.log('📦 Command-stream loaded (version unknown)');
  }

  // Test the JSON quoting issue
  const testJson = '{"test": "value with \\"quotes\\""}';
  const result = await $`echo "JSON: ${testJson}"`.run({
    capture: true,
    mirror: false
  });
  
  const output = result.stdout.trim();
  const extractedJson = output.replace('JSON: ', '');
  
  console.log('\n🧪 Test Results:');
  console.log('Input JSON :', testJson);
  console.log('Output     :', extractedJson);
  
  // Check if JSON is properly handled (not wrapped in extra quotes)
  let isFixed = false;
  try {
    // If it's properly handled, we should be able to parse it
    const parsed = JSON.parse(extractedJson);
    if (parsed && typeof parsed === 'object') {
      isFixed = true;
      console.log('✅ FIXED: JSON is properly handled without extra quoting!');
      console.log('🎉 You can now update claude-profiles.mjs to use command-stream');
    }
  } catch (parseError) {
    console.log('❌ NOT FIXED: JSON is still corrupted by extra quoting');
    console.log('   Expected:', testJson);  
    console.log('   Got     :', extractedJson);
  }
  
  // Additional checks
  console.log('\n📊 Status:');
  if (isFixed) {
    console.log('🟢 Issue Status: RESOLVED');
    console.log('🔧 Action Needed: Update claude-profiles.mjs to use command-stream');
    console.log('📝 Update Instructions: See COMMAND_STREAM_ISSUE.md');
  } else {
    console.log('🔴 Issue Status: NOT YET RESOLVED');
    console.log('⏳ Action Needed: Continue monitoring for fix');
    console.log('🔗 Track: https://github.com/link-foundation/command-stream/issues/39');
  }
  
} catch (error) {
  console.error('❌ Error testing command-stream:', error.message);
  console.log('\n💡 This might indicate:');
  console.log('   - Network connectivity issues');
  console.log('   - Command-stream package issues');
  console.log('   - Breaking changes in the library');
}

console.log('\n📅 Last checked:', new Date().toISOString());
console.log('🔄 Run this script periodically to monitor for fixes');