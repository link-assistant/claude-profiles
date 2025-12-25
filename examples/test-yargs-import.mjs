#!/usr/bin/env node

/**
 * Test script to verify yargs import works in different environments
 * This simulates how the main script loads yargs
 */

console.log('Testing yargs import compatibility...');

// Simulate use-m loading
const { use } = eval(
  await fetch('https://unpkg.com/use-m/use.js').then(r => r.text())
);

// Load yargs the same way as main script
const yargsModule = await use('yargs@17.7.2');
const yargsHelpers = await use('yargs@17.7.2/helpers');

// Apply the same compatibility fix
const yargs = typeof yargsModule === 'function' ? yargsModule : yargsModule.default || yargsModule;
const { hideBin } = yargsHelpers;

console.log('yargs type:', typeof yargs);
console.log('yargs is function:', typeof yargs === 'function');
console.log('hideBin type:', typeof hideBin);

// Test actual usage
try {
  const argv = yargs(hideBin(['node', 'test', '--help']))
    .option('test', {
      type: 'boolean',
      description: 'Test option'
    })
    .help()
    .argv;
  
  console.log('✅ yargs import and usage test passed!');
  console.log('Arguments parsed:', argv);
} catch (error) {
  console.error('❌ yargs test failed:', error.message);
  process.exit(1);
}