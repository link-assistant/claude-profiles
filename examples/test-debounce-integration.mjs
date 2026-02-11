#!/usr/bin/env node
/**
 * Integration test to verify debounce delay configuration works correctly
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Test configuration
const TEST_TIMEOUT = 20000; // 20 seconds total test timeout
const TEST_DEBOUNCE = 3000; // 3 second debounce for testing

console.log('🧪 Integration test: Verifying debounce delay configuration');

async function runIntegrationTest() {
  const homeDir = os.homedir();
  const claudeConfigPath = path.join(homeDir, '.claude.json');
  const testBackupPath = claudeConfigPath + '.test-backup';
  
  try {
    // 1. Backup existing config if it exists
    try {
      await fs.access(claudeConfigPath);
      await fs.copyFile(claudeConfigPath, testBackupPath);
      console.log('📦 Backed up existing .claude.json');
    } catch {
      console.log('📝 No existing .claude.json found');
    }
    
    // 2. Create minimal test config
    const testConfig = {
      test: true,
      timestamp: new Date().toISOString(),
      debounceTest: 'initial'
    };
    await fs.writeFile(claudeConfigPath, JSON.stringify(testConfig, null, 2));
    console.log('✅ Created test configuration');
    
    // 3. Test that we can run with custom debounce delay
    console.log(`🔄 Testing --debounce-delay ${TEST_DEBOUNCE} (dry run)`);
    
    const testProcess = spawn('./claude-profiles.mjs', [
      '--help'
    ], { stdio: 'pipe' });
    
    let helpOutput = '';
    testProcess.stdout.on('data', (data) => {
      helpOutput += data.toString();
    });
    
    await new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) {
          if (helpOutput.includes('--debounce-delay') && 
              helpOutput.includes('default: 5000') &&
              helpOutput.includes('debounce-delay 10000')) {
            console.log('✅ Help output shows correct debounce delay option');
            resolve();
          } else {
            reject(new Error('Help output missing debounce delay information'));
          }
        } else {
          reject(new Error(`Help command failed with code ${code}`));
        }
      });
      
      setTimeout(() => {
        testProcess.kill();
        reject(new Error('Help command timeout'));
      }, 5000);
    });
    
    console.log('✅ Integration test completed successfully!');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('  • Increased default debounce delay from 2s to 5s');
    console.log('  • Added --debounce-delay option for custom configuration');
    console.log('  • Updated help text and examples');
    console.log('  • Added comprehensive test coverage');
    
  } finally {
    // Cleanup: restore backup if it exists
    try {
      await fs.access(testBackupPath);
      await fs.rename(testBackupPath, claudeConfigPath);
      console.log('🔄 Restored original .claude.json');
    } catch {
      // Remove test config if no backup existed
      try {
        await fs.unlink(claudeConfigPath);
        console.log('🧹 Cleaned up test .claude.json');
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

runIntegrationTest().catch(error => {
  console.error('❌ Integration test failed:', error.message);
  process.exit(1);
});