---
'@link-assistant/claude-profiles': minor
---

Add changeset support and OIDC trusted publishing to npm

This major infrastructure update modernizes the release workflow:

- **Changeset Integration**: Implement changesets for version management and automated changelog generation
- **OIDC Trusted Publishing**: Use OpenID Connect for secure, token-free npm publishing
- **Automated Releases**: GitHub Actions automatically handle versioning, publishing, and release creation
- **Manual Release Options**: Support both instant releases and changeset PR workflows
- **CI/CD Pipeline**: Validate changesets on PRs and test across Node.js 18, 20, 22
- **Comprehensive Scripts**: Add automation scripts for version bumps, publishing, and release management

Breaking changes:
- Removed old publish.yml workflow (replaced by release.yml)
- Publishing now exclusively via OIDC through release.yml workflow

Contributors and maintainers should now use changesets for all version bumps (see README for details).
