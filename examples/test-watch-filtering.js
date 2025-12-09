#!/usr/bin/env node

/**
 * Test script for watch mode filtering logic
 */

console.log('🧪 Testing watch mode filtering logic\n');

// Mock the shouldIgnoreFileChange function logic
function shouldIgnoreFileChange(filename, options) {
  // Skip projects folder if --skip-projects is enabled
  if (options.skipProjects && (filename.includes('/projects/') || filename.includes('\\projects\\') || 
                               filename.endsWith('/projects') || filename.endsWith('\\projects'))) {
    return true;
  }
  
  // Skip nested .claude directories (any .claude that's not at the immediate root level)
  // This matches the same logic used in the archiving process
  const pathParts = filename.split(/[/\\]/);
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] === '.claude' && i > 0) {
      // Found .claude directory nested inside another directory
      // Only allow if it's the direct child of home (~) or at the immediate root
      if (i === 1 && (pathParts[0] === '~' || pathParts[0] === '.claude')) {
        // This is ~/.claude/... or .claude/... which is allowed
        continue;
      }
      return true;
    }
  }
  
  return false;
}

// Test cases
const testFiles = [
    // Normal files that should NOT be ignored
    '~/.claude/config.json',
    '~/.claude/settings.json',
    '~/.claude/ide/lock.file',
    '~/.claude/statsig/data.json',
    '~/.claude/todos/todo.json',
    '~/.claude/plugins/config.json',
    
    // Projects that SHOULD be ignored with --skip-projects
    '~/.claude/projects/project1/file.json',
    '~/.claude/projects/another.json',
    '~/.claude/projects/',
    '~/.claude/projects',
    
    // Nested .claude directories that SHOULD be ignored
    '~/.claude/subdir/.claude/file.json',
    '~/.claude/path/to/.claude/deeply/nested.json',
    '~/.claude/some/.claude',
    '~/.claude/nested/.claude/',
    
    // Edge cases
    '.claude/config.json', // Root .claude files (should NOT be ignored)
    'normal/path/file.json',
];

console.log('Test cases:');
testFiles.forEach(file => console.log(`  ${file}`));

console.log('\n--- Testing without --skip-projects ---');
const optionsNoSkip = { skipProjects: false };
console.log('Files that would be IGNORED:');
testFiles.forEach(file => {
  const ignored = shouldIgnoreFileChange(file, optionsNoSkip);
  if (ignored) {
    console.log(`  ✗ ${file}`);
  }
});

console.log('\n--- Testing with --skip-projects enabled ---');
const optionsWithSkip = { skipProjects: true };
console.log('Files that would be IGNORED:');
testFiles.forEach(file => {
  const ignored = shouldIgnoreFileChange(file, optionsWithSkip);
  if (ignored) {
    console.log(`  ✗ ${file}`);
  }
});

console.log('\n--- Files that would be WATCHED (not ignored) with --skip-projects ---');
testFiles.forEach(file => {
  const ignored = shouldIgnoreFileChange(file, optionsWithSkip);
  if (!ignored) {
    console.log(`  ✓ ${file}`);
  }
});

// Verify expected behavior
const expectedIgnored = [
  '~/.claude/projects/project1/file.json',
  '~/.claude/projects/another.json', 
  '~/.claude/projects/',
  '~/.claude/projects',
  '~/.claude/subdir/.claude/file.json',
  '~/.claude/path/to/.claude/deeply/nested.json',
  '~/.claude/some/.claude',
  '~/.claude/nested/.claude/'
];

let allCorrect = true;
for (const expectedFile of expectedIgnored) {
  const actuallyIgnored = shouldIgnoreFileChange(expectedFile, optionsWithSkip);
  if (!actuallyIgnored) {
    console.log(`❌ ERROR: Expected ${expectedFile} to be ignored, but it wasn't`);
    allCorrect = false;
  }
}

const expectedWatched = [
  '~/.claude/config.json',
  '~/.claude/settings.json', 
  '~/.claude/ide/lock.file',
  '.claude/config.json'
];

for (const expectedFile of expectedWatched) {
  const actuallyIgnored = shouldIgnoreFileChange(expectedFile, optionsWithSkip);
  if (actuallyIgnored) {
    console.log(`❌ ERROR: Expected ${expectedFile} to be watched, but it was ignored`);
    allCorrect = false;
  }
}

console.log(`\n${allCorrect ? '✅' : '❌'} Filter logic test: ${allCorrect ? 'PASSED' : 'FAILED'}`);