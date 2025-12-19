#!/usr/bin/env node

/**
 * Custom changeset version script
 *
 * This script:
 * 1. Runs `changeset version` to update package versions
 *
 * Uses link-foundation libraries:
 * - use-m: Dynamic package loading without package.json dependencies
 * - command-stream: Modern shell command execution with streaming support
 */

// Load use-m dynamically
const { use } = eval(
  await (await fetch('https://unpkg.com/use-m/use.js')).text()
);

// Import command-stream for shell command execution
const { $ } = await use('command-stream');

try {
  console.log('Running changeset version...');
  await $`npx changeset version`;

  console.log('\n✅ Version bump complete');
} catch (error) {
  console.error('Error during version bump:', error.message);
  if (process.env.DEBUG) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}
