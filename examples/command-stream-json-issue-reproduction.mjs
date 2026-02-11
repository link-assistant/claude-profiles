#!/usr/bin/env node
// Minimal reproduction of command-stream JSON quoting issue affecting claude-profiles.mjs

// This is the same import used in claude-profiles.mjs
const { use } = eval(
  await fetch('https://unpkg.com/use-m/use.js').then(r => r.text())
);
const [{ $ }] = await Promise.all([
  use('command-stream@0.7.0')
]);

// Sample credentials data similar to what claude-profiles.mjs handles
const credentials = {
  claudeAiOauth: {
    accessToken: "sample_access_token_123",
    refreshToken: "sample_refresh_token_456",
    name: "Test User",
    description: "User with \"quotes\" and 'apostrophes'"
  }
};

console.log('Testing command-stream JSON interpolation issue...\n');

const jsonStr = JSON.stringify(credentials);
const escapedJson = jsonStr.replace(/"/g, '\\"'); // Escape quotes like in claude-profiles.mjs

console.log('Original JSON:', jsonStr);
console.log('Escaped JSON:', escapedJson);

try {
  // This is the exact command that fails in claude-profiles.mjs line 387
  console.log('\nTesting command-stream $ interpolation:');
  const result = await $`echo "JSON would be: ${escapedJson}"`.run({
    capture: true,
    mirror: false
  });
  
  console.log('Command output:', result.stdout);
  console.log('Expected: JSON with proper double quotes');
  console.log('Actual: JSON wrapped in single quotes (invalid for parsing)');
  
  // Show the difference
  console.log('\nActual behavior:');
  console.log('command-stream wraps the entire JSON in single quotes:');
  console.log("'", result.stdout.trim().replace('JSON would be: ', ''), "'");
  
  console.log('\nExpected behavior:');  
  console.log('JSON should remain as valid JSON without extra quoting:');
  console.log(jsonStr);
  
} catch (error) {
  console.error('Command failed:', error.message);
}

console.log('\nThis issue prevents claude-profiles.mjs from using command-stream');
console.log('for the keychain storage command at line 387.');
console.log('The workaround is using Node.js execSync instead.');