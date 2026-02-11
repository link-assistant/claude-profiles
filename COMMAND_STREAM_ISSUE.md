# Command-Stream JSON Quoting Issue Tracking

## Issue Summary
The `claude-profiles.mjs` script cannot use command-stream for macOS keychain storage commands due to automatic quote wrapping that corrupts JSON data.

## Affected Code Location
- **File**: `claude-profiles.mjs`
- **Line**: 387-391 (commented out code)
- **Function**: `setKeychainCredentials()`

## Problem Description
Command-stream's `$` template function automatically wraps interpolated values in single quotes, which corrupts JSON strings:

```javascript
// ❌ Current issue (line 387-391 in claude-profiles.mjs)
const result = await $`security add-generic-password -U -a $USER -s "Claude Code-credentials" -w "${escapedJson}"`;
// Results in: '{"claudeAiOauth":{...}}'  ← Invalid JSON with wrapping quotes
// Expected:   {"claudeAiOauth":{...}}   ← Valid JSON
```

## Current Workaround
Using Node.js `execSync` instead (lines 372-376):
```javascript
const command = `security add-generic-password -U -a $USER -s "Claude Code-credentials" -w "${escapedJson}"`;
execSync(command, { shell: true, stdio: isVerbose ? 'inherit' : 'ignore' });
```

## Upstream Issue Tracking
- **Repository**: https://github.com/link-foundation/command-stream
- **Issue #39**: JSON strings with quotes cause escaping issues
- **Issue #45**: Automatic quote addition in interpolation causes issues
- **Status**: OPEN (as of 2025-09-10)
- **Our Comment**: https://github.com/link-foundation/command-stream/issues/39#issuecomment-3275976359

## Monitoring for Fix
To check if the issue has been resolved:

1. **Check issue status**: Visit issue #39 and #45 on the command-stream repository
2. **Test with reproduction script**: Run `examples/command-stream-json-issue-reproduction.mjs`
3. **Check for new releases**: Monitor https://www.npmjs.com/package/command-stream for versions > 0.7.0

## How to Update When Fixed
When the issue is resolved:

1. Uncomment the command-stream code (lines 387-391)
2. Remove or comment the execSync workaround (lines 372-376) 
3. Test with various JSON payloads to ensure reliability
4. Update the version constraint in the use() call if needed

## Testing the Fix
Use the reproduction script to verify the fix:
```bash
node examples/command-stream-json-issue-reproduction.mjs
```

Expected output after fix:
- JSON should not be wrapped in extra single quotes
- Command output should show valid JSON format
- No escaping issues with nested quotes

## Related Files
- `claude-profiles.mjs` - Main script with the affected code
- `examples/command-stream-json-issue-reproduction.mjs` - Test reproduction script