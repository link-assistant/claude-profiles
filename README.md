[![npm](https://img.shields.io/npm/v/@link-assistant/claude-profiles.svg)](https://npmjs.com/@link-assistant/claude-profiles)
[![License](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://github.com/link-assistant/claude-profiles/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/link-assistant/claude-profiles?style=social)](https://github.com/link-assistant/claude-profiles/stargazers)

[![Open in Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-f29718?logo=gitpod)](https://gitpod.io/#https://github.com/link-assistant/claude-profiles)
[![Open in GitHub Codespaces](https://img.shields.io/badge/GitHub%20Codespaces-Open-181717?logo=github)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=link-assistant/claude-profiles)

# Claude Profiles

A powerful CLI tool to manage multiple Claude configuration profiles using GitHub Gists as secure cloud storage. This tool enables you to store, restore, and synchronize Claude configurations across machines, supporting both macOS and Linux platforms with automatic credential format conversion.

Perfect for developers working with:
- **Cloud Development Environments**: GitPod, GitHub Codespaces, and other cloud IDEs
- **Multiple Devices**: Seamlessly sync profiles between your macOS laptop, Linux desktop, and cloud workspaces
- **Team Environments**: Share configurations across team development environments
- **Ephemeral Environments**: Quickly restore your Claude setup in temporary containers or VMs

## Features

### Core Functionality
- **Profile Management**: Store, restore, and delete multiple Claude configuration profiles
- **Cloud Storage**: Uses GitHub Gists (secret) for secure profile storage
- **Cross-Platform Support**: Works on macOS and Linux with automatic credential format conversion
- **macOS Keychain Integration**: Fully supports macOS Keychain credentials storage and retrieval
- **Watch Mode**: Automatically saves configuration changes to a profile with intelligent debouncing
- **Profile Verification**: Validates profile integrity before restoration
- **No Dependencies**: Uses dynamic module loading (use-m) - no package.json required
- **Comprehensive Logging**: Optional file logging and verbose mode for debugging

### What Gets Backed Up
- `~/.claude/` directory - **entire directory with all subdirectories and files**:
  - IDE lock files (`ide/*.lock`)
  - Plugin configurations (`plugins/`)
  - Project history and conversations (`projects/`)
  - Todo items (`todos/`)
  - Shell snapshots (`shell-snapshots/`)
  - Settings and statistics (`settings.json`, `statsig/`)
  - All other Claude-related data
- `~/.claude.json` (main configuration file)
- `~/.claude.json.backup` (configuration backup)
- macOS Keychain credentials (exported to archive as `.macos.credentials.json`)
- Linux credentials file (`~/.claude/.credentials.json`)

### Restore Behavior
**Important**: When restoring a profile:
- **Files are overwritten**: Existing files with the same name will be replaced
- **New files are added**: Files from the backup are added to existing directories
- **Existing files are preserved**: Files not in the backup remain untouched
- **Merge behavior**: The restore process merges the backup with existing content:
  - Project conversations are merged (existing conversations remain)
  - Todo items are merged (existing todos remain)
  - Settings files (`settings.json`, `config.json`) are overwritten with backup versions
  - Lock files and temporary files are overwritten

## Installation

### Prerequisites
- Node.js (v18 or higher)
- GitHub CLI (`gh`) authenticated with gist permissions
- `unzip` command (pre-installed on macOS, may need installation on Linux)

### Install via Package Manager (Recommended)

#### Using Bun (Fastest)
```bash
bun install -g @link-assistant/claude-profiles
```

#### Using npm
```bash
npm install -g @link-assistant/claude-profiles
```

After installation, the tool will be available globally as `claude-profiles`:

```bash
claude-profiles --help
```

### Install from Source

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS
   brew install gh

   # Ubuntu/Debian
   sudo apt install gh

   # Other Linux distributions
   # Visit: https://github.com/cli/cli#installation
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login -s gist
   ```
   Follow the prompts and ensure you grant the `gist` scope for creating and managing gists.

3. **Clone or download the tool**:
   ```bash
   # Option A: Clone the repository
   git clone https://github.com/link-assistant/claude-profiles.git
   cd claude-profiles
   chmod +x claude-profiles.mjs

   # Option B: Download directly
   curl -O https://raw.githubusercontent.com/link-assistant/claude-profiles/main/claude-profiles.mjs
   chmod +x claude-profiles.mjs
   ```

4. **Verify installation**:
   ```bash
   # If installed via npm
   claude-profiles --list
   
   # If using from source
   ./claude-profiles.mjs --list
   ```

## Usage

### Basic Commands

#### List All Profiles
```bash
claude-profiles --list
# or
claude-profiles -l
```

#### Store Current Configuration
```bash
claude-profiles --store work
# or
claude-profiles --save work
# or
claude-profiles -s work
```

#### Restore a Profile
```bash
claude-profiles --restore personal
# or
claude-profiles -r personal
```

#### Delete a Profile
```bash
claude-profiles --delete old-profile
# or
claude-profiles -d old-profile
```

#### Verify Profile Integrity
```bash
claude-profiles --verify work
# or
claude-profiles -v work
```

**Note**: If you're using the tool from source instead of npm, prefix commands with `./` like `./claude-profiles.mjs --list`

### Advanced Features

#### Watch Mode
Automatically saves configuration changes to a profile with a 30-second throttle:
```bash
claude-profiles --watch work

# With verbose logging
claude-profiles --watch work --verbose

# With file logging
claude-profiles --watch work --log

# With custom log file
claude-profiles --watch work --log=/path/to/log-file.txt
```

**Watch Mode Features:**
- Monitors all Claude configuration files for changes
- Debounced saves (waits 2 seconds after last change)
- Minimum 30-second interval between saves to prevent excessive updates
- On macOS, also monitors Keychain credentials changes
- Graceful shutdown with Ctrl+C

#### Verbose Mode
Enable detailed logging for troubleshooting:
```bash
claude-profiles --store work --verbose
```

#### File Logging
Save all output to a log file:
```bash
# Auto-generated filename with timestamp
claude-profiles --store work --log

# Custom log file
claude-profiles --store work --log=claude-backup.log
```

## Profile Names

Profile names must follow these rules:
- Only lowercase letters (a-z)
- Numbers (0-9)
- Hyphens (-)
- Examples: `work`, `personal`, `client-1`, `dev-2024`

## Cross-Platform Support

### macOS ↔ Linux Profile Compatibility

The tool automatically handles credential format conversion between platforms:

#### macOS → Linux
When restoring a macOS profile on Linux:
- Keychain credentials are converted to Linux format
- Credentials are saved to `~/.claude/.credentials.json`
- Both old (underscore) and new (claudeAiOauth) formats are supported

#### Linux → macOS
When restoring a Linux profile on macOS:
- Linux credentials are converted to Keychain format
- Credentials are stored in macOS Keychain
- Legacy Linux formats are automatically upgraded

### Credential Formats

The tool supports multiple credential formats:

1. **Modern Format** (with claudeAiOauth wrapper):
   ```json
   {
     "claudeAiOauth": {
       "accessToken": "...",
       "refreshToken": "...",
       "expiresAt": "...",
       "scopes": ["user:inference"],
       "subscriptionType": "max"
     }
   }
   ```

2. **Legacy Linux Format** (underscore format):
   ```json
   {
     "access_token": "...",
     "refresh_token": "...",
     "expiry_date": "...",
     "scopes": ["user:inference"],
     "subscriptionType": "max"
   }
   ```

All formats are automatically detected and converted as needed.

## Error Handling & Edge Cases

### GitHub Authentication Issues

#### Missing Gist Scope
**Problem**: Token lacks gist permissions
```
❌ Permission error creating gist
```
**Solution**:
```bash
gh auth refresh -s gist
```

#### Wrong Account
**Problem**: Gist owned by different GitHub account
```
❌ HTTP 409 - Gist cannot be updated
```
**Solution**:
```bash
# Check current account
gh auth status

# Re-login with correct account
gh auth login
```

#### Rate Limiting
**Problem**: Too many API requests
```
⚠️ GitHub API rate limit exceeded
```
**Solution**: Wait a few minutes and try again

### Profile Issues

#### Missing Essential Files
**Problem**: Claude configuration incomplete
```
❌ Cannot create profile - essential files are missing
```
**Solution**: 
- Ensure Claude is properly configured
- Use Claude at least once to generate config files
- Check that `~/.claude/` directory exists

#### Large Profiles
**Problem**: Profile exceeds GitHub's 10MB gist limit
```
❌ Profile is too large for GitHub Gist (>10MB)
```
**Solution**:
- Clean up `~/.claude/` directory
- Remove unnecessary files or cache
- Consider splitting into multiple profiles

#### Corrupted Profile
**Problem**: Profile verification fails
```
❌ Cannot restore profile - verification failed
```
**Solution**:
- Use `--verify` to check profile integrity
- Create a new backup with `--store`
- Check if the profile was created on a different platform

### Platform-Specific Issues

#### macOS Keychain Access
**Problem**: Cannot access Keychain
```
⚠️ No credentials found in macOS Keychain
```
**Solution**:
- Ensure Claude has been used at least once
- Check Keychain Access app for "Claude Code-credentials"
- Grant terminal access to Keychain if prompted

#### Linux Missing unzip
**Problem**: unzip command not found
```
📦 The unzip command is required but not installed
```
**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install unzip

# Alpine
apk add unzip

# RHEL/CentOS
sudo yum install unzip
```

### Network Issues

#### Connection Problems
**Problem**: Cannot connect to GitHub
```
🌐 Network error while accessing GitHub
```
**Solution**:
- Check internet connection
- Verify GitHub is accessible: `ping github.com`
- Check proxy settings if behind firewall

### File System Issues

#### Permission Denied
**Problem**: Cannot read/write Claude files
```
📝 Permission denied
```
**Solution**:
```bash
# Check permissions
ls -la ~/.claude/

# Fix ownership (if needed)
chown -R $USER:$USER ~/.claude
```

#### Disk Space
**Problem**: No space for extraction
```
💾 No space left on device
```
**Solution**:
- Free up disk space
- Use a different temp directory: `export TMPDIR=/path/to/space`

## Security Considerations

1. **Gist Privacy**: All profiles are stored as **secret** gists (not public)
2. **Credential Security**: 
   - macOS: Stored securely in Keychain
   - Linux: Stored in user-only readable file
   - Transit: Base64 encoded (not encrypted)
3. **GitHub Authentication**: Uses GitHub CLI's secure token storage
4. **File Permissions**: Restored files maintain appropriate permissions

## Troubleshooting

### Enable Debug Output
```bash
# Verbose mode for detailed logging
claude-profiles --store work --verbose

# Save debug output to file
claude-profiles --store work --verbose --log=debug.log
```

### Check GitHub Status
```bash
# Verify GitHub CLI authentication
gh auth status

# Test gist access
echo "test" | gh gist create -

# List your gists
gh gist list --limit 5
```

### Manual Gist Management
```bash
# View gist contents
gh gist list | grep claude-profiles
gh gist view <GIST_ID>

# Delete gist entirely (removes all profiles)
gh gist delete <GIST_ID>
```

### Common Solutions

1. **First Time Setup**:
   ```bash
   # 1. Install the tool (bun is faster)
   bun install -g @link-assistant/claude-profiles
   # or: npm install -g @link-assistant/claude-profiles

   # 2. Authenticate GitHub CLI
   gh auth login -s gist

   # 3. Create your first profile
   claude-profiles --store default

   # 4. List profiles to confirm
   claude-profiles --list
   ```

2. **Switching Between Profiles**:
   ```bash
   # Save current state
   claude-profiles --store current-work
   
   # Switch to different profile
   claude-profiles --restore personal
   
   # Later, switch back
   claude-profiles --restore current-work
   ```

3. **Migrating to New Machine**:
   ```bash
   # On old machine
   claude-profiles --store migration

   # On new machine (after installing and gh auth)
   bun install -g @link-assistant/claude-profiles
   claude-profiles --restore migration
   ```

## Technical Details

### Storage Format
- Profiles are stored as ZIP archives
- Archives are base64-encoded for gist compatibility
- Each profile is a separate file in the gist
- Gist description: "claude-profiles-backup"

### File Structure in Archive
```
profile.zip.base64
├── .claude/                        # Complete directory structure
│   ├── .credentials.json          # Linux credentials (if present)
│   ├── ide/                       # IDE lock files
│   ├── plugins/                   # Plugin configurations
│   │   ├── config.json
│   │   └── repos/
│   ├── projects/                  # Project conversations
│   │   └── [project-folders]/     # Individual project histories
│   ├── settings.json              # Claude settings
│   ├── shell-snapshots/           # Shell session snapshots
│   ├── statsig/                   # Usage statistics
│   └── todos/                     # Todo items
├── .claude.json                   # Main configuration
├── .claude.json.backup            # Configuration backup
└── .macos.credentials.json        # macOS Keychain export (see note below)
```

### macOS Credentials Handling

**Important Note about `.macos.credentials.json`**:
- This is an **internal file** created by the tool, not a Claude system file
- It only exists within the backup archive stored on GitHub Gist
- **Purpose**: Exports macOS Keychain credentials for cross-platform compatibility
- **On restore**:
  - **To macOS**: Credentials are restored directly to Keychain (file is not created on disk)
  - **To Linux**: Credentials are converted and saved as `~/.claude/.credentials.json`
- This file never appears in your local filesystem on macOS - credentials always stay in Keychain

### Dependencies
The tool uses dynamic loading via `use-m` for zero-install dependencies:
- `command-stream@0.7.0` - Shell command execution
- `yargs@17.7.2` - CLI argument parsing
- `archiver@7.0.1` - ZIP archive creation

## License

This project is released into the public domain under The Unlicense. See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests at:
https://github.com/link-assistant/claude-profiles

## Support

For issues, questions, or feature requests, please open an issue on GitHub:
https://github.com/link-assistant/claude-profiles/issues
