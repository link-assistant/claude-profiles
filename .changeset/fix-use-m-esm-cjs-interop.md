---
"@link-assistant/claude-profiles": patch
---

Fix TypeError when running on Node.js v24+ due to use-m ESM/CJS interop

`use-m` wraps CJS modules (like `yargs`) under a `.default` property when
loading them into an ESM context. On Node.js v24, this causes `yargs` to
not be callable and `hideBin` to be `undefined`, resulting in:

  TypeError: hideBin is not a function
  TypeError: yargs is not a function

The fix defensively unwraps `.default` when the loaded value is not already
a function, and provides a fallback for `hideBin` (which is just `argv.slice(2)`).
