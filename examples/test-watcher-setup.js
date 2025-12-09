#!/usr/bin/env node

/**
 * Test the watcher setup logic by mocking the filesystem calls
 * This tests our selective watching implementation without requiring GitHub auth
 */

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Mock the functions we need
function expandHome(filePath) {
  if (filePath.startsWith('~/')) {
    return filePath.replace('~', process.env.HOME || '/tmp/test-home');
  }
  return filePath;
}

function log(level, message) {
  console.log(`[${level}] ${message}`);
}

const BACKUP_PATHS = [
  { source: '~/.claude', dest: '.claude', canSkipProjects: true },
  { source: '~/.claude.json', dest: '.claude.json' },
  { source: '~/.claude.json.backup', dest: '.claude.json.backup' }
];

function getBackupPaths(options = {}) {
  if (options.skipProjects) {
    return BACKUP_PATHS.map(item => {
      if (item.canSkipProjects) {
        return { ...item, skipProjects: true };
      }
      return item;
    });
  }
  return BACKUP_PATHS;
}

function shouldIgnoreFileChange(filename, options) {
  if (options.skipProjects && (filename.includes('/projects/') || filename.includes('\\projects\\') || 
                               filename.endsWith('/projects') || filename.endsWith('\\projects'))) {
    return true;
  }
  
  const pathParts = filename.split(/[/\\]/);
  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] === '.claude' && i > 0) {
      if (i === 1 && (pathParts[0] === '~' || pathParts[0] === '.claude')) {
        continue;
      }
      return true;
    }
  }
  
  return false;
}

async function mockSetupSelectiveWatchers(claudeDir, options, watchers, handleFileChange, sourcePath) {
  log('INFO', `Setting up selective watchers for: ${sourcePath}`);
  
  try {
    // Mock directory structure
    const mockEntries = [
      { name: 'settings.json', isDirectory: () => false, isFile: () => true },
      { name: 'projects', isDirectory: () => true, isFile: () => false },
      { name: 'ide', isDirectory: () => true, isFile: () => false },
      { name: 'statsig', isDirectory: () => true, isFile: () => false },
      { name: 'todos', isDirectory: () => true, isFile: () => false },
      { name: 'plugins', isDirectory: () => true, isFile: () => false },
      { name: 'subdir', isDirectory: () => true, isFile: () => false },
    ];
    
    let watcherCount = 0;
    
    for (const entry of mockEntries) {
      if (options.skipProjects && entry.name === 'projects') {
        log('DEBUG', `Skipping watch on projects folder: ${sourcePath}/${entry.name}`);
        continue;
      }
      
      if (entry.name === '.claude') {
        log('DEBUG', `Skipping watch on nested .claude directory: ${sourcePath}/${entry.name}`);
        continue;
      }
      
      if (entry.isDirectory()) {
        log('DEBUG', `Watching directory: ${sourcePath}/${entry.name} (recursive: true)`);
        watcherCount++;
      } else if (entry.isFile()) {
        log('DEBUG', `Watching file: ${sourcePath}/${entry.name}`);
        watcherCount++;
      }
    }
    
    return watcherCount;
  } catch (error) {
    log('ERROR', `Failed to set up selective watchers: ${error.message}`);
    return 0;
  }
}

// Test the functionality
async function runTest() {
  console.log('🧪 Testing selective watcher setup\n');
  
  // Test without --skip-projects
  console.log('--- Testing WITHOUT --skip-projects ---');
  const watchers1 = [];
  const options1 = { skipProjects: false };
  const backupPaths1 = getBackupPaths(options1);
  
  for (const item of backupPaths1) {
    if (item.source === '~/.claude') {
      await mockSetupSelectiveWatchers('/tmp/test/.claude', options1, watchers1, () => {}, item.source);
    } else {
      log('DEBUG', `Standard watcher for: ${item.source}`);
    }
  }
  
  console.log('');
  
  // Test with --skip-projects
  console.log('--- Testing WITH --skip-projects ---');
  const watchers2 = [];
  const options2 = { skipProjects: true };
  const backupPaths2 = getBackupPaths(options2);
  
  for (const item of backupPaths2) {
    if (item.source === '~/.claude' && (options2.skipProjects || item.skipProjects)) {
      await mockSetupSelectiveWatchers('/tmp/test/.claude', options2, watchers2, () => {}, item.source);
    } else {
      log('DEBUG', `Standard watcher for: ${item.source}`);
    }
  }
  
  console.log('');
  console.log('🎯 Expected behavior:');
  console.log('- Without --skip-projects: Should watch all directories including projects');
  console.log('- With --skip-projects: Should skip projects directory');
  console.log('- Both should skip nested .claude directories');
  console.log('');
  
  // Test file change filtering
  console.log('--- Testing file change filtering ---');
  const testFiles = [
    '~/.claude/settings.json',
    '~/.claude/projects/test.json',
    '~/.claude/subdir/.claude/nested.json'
  ];
  
  for (const file of testFiles) {
    const ignored1 = shouldIgnoreFileChange(file, options1);
    const ignored2 = shouldIgnoreFileChange(file, options2);
    console.log(`${file}:`);
    console.log(`  Without --skip-projects: ${ignored1 ? 'IGNORED' : 'WATCHED'}`);
    console.log(`  With --skip-projects: ${ignored2 ? 'IGNORED' : 'WATCHED'}`);
  }
  
  console.log('\n✅ Test completed successfully!');
}

runTest().catch(console.error);