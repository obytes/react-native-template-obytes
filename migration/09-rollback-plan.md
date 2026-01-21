# Rollback Plan

## Overview

If you encounter critical issues during or after the migration, this guide provides strategies to rollback changes safely.

**Important:** Always commit your work at key milestones so you have safe restore points.

---

## Pre-Rollback Checklist

Before rolling back, try these quick fixes:

- [ ] Clear all caches (`rm -rf node_modules .expo android ios`)
- [ ] Reinstall dependencies (`pnpm install`)
- [ ] Restart Metro bundler (`expo start -c`)
- [ ] Restart VS Code
- [ ] Check error messages carefully
- [ ] Search for the error in GitHub Issues
- [ ] Review the specific migration guide for common issues

**If issues persist, proceed with rollback.**

---

## Full Rollback (Revert Everything)

### Option 1: Using Git Reset (Recommended)

If you haven't pushed your changes yet:

```bash
# See your commit history
git log --oneline

# Reset to before migration (replace <commit-hash> with actual hash)
git reset --hard <commit-hash>

# Example:
git reset --hard HEAD~10  # Go back 10 commits

# Reinstall old dependencies
rm -rf node_modules .expo android ios
pnpm install

# Rebuild
pnpm prebuild
```

**Caution:** This permanently deletes uncommitted changes.

---

### Option 2: Using Git Revert (For Pushed Commits)

If you already pushed to remote:

```bash
# Revert the merge commit or specific commits
git revert <commit-hash>

# Or revert a range
git revert <start-commit>..<end-commit>

# Push the revert
git push
```

**Note:** This creates new commits that undo previous changes.

---

### Option 3: Using Backup Branch

If you created a backup branch before starting:

```bash
# Switch to backup branch
git checkout backup/pre-upgrade

# Create new branch from backup
git checkout -b main-restored

# Force push to restore (DANGEROUS - coordinate with team)
git push origin main-restored:main --force

# Or merge backup into current branch
git checkout main
git merge backup/pre-upgrade
```

---

## Partial Rollback (Revert Specific Migrations)

If only one migration is problematic, you can rollback just that part.

### Rollback ESLint Migration

```bash
# Restore old config files
git checkout HEAD~1 -- eslint.config.mjs .prettierrc.js .prettierignore package.json pnpm-lock.yaml

# Restore VS Code settings (if needed)
git checkout HEAD~1 -- .vscode/settings.json

# Reinstall old dependencies
pnpm install

# Restart VS Code
```

**Files to restore:**
- `eslint.config.mjs` (or `.eslintrc.js` if you had that)
- `.prettierrc.js`
- `.prettierignore`
- `package.json`
- `.vscode/settings.json`

---

### Rollback Expo SDK 54

```bash
# Downgrade to SDK 53
pnpm add expo@~53.0.12
npx expo install --fix

# Downgrade React and React Native
pnpm add react@19.0.0 react-native@0.79.4 react-dom@19.0.0

# Downgrade jest-expo
pnpm add -D jest-expo@~53.0.7

# Clean rebuild
rm -rf node_modules .expo android ios
pnpm install
pnpm prebuild
```

**Test after rollback:**
```bash
pnpm ios
pnpm android
```

---

### Rollback Environment Variables

```bash
# Restore old env.js
git checkout HEAD~1 -- env.js

# Restore old env files
git checkout HEAD~1 -- .env.development .env.staging .env.production

# Restore babel config (with @env alias)
git checkout HEAD~1 -- babel.config.js

# Restore package.json scripts
git checkout HEAD~1 -- package.json

# Reinstall
pnpm install
```

**Find and revert env variable changes in code:**

```bash
# Find files using process.env.EXPO_PUBLIC_*
grep -r "process.env.EXPO_PUBLIC_" src/

# Revert to @env imports
# This requires manual changes
```

---

### Rollback Uniwind (Back to NativeWind)

```bash
# Remove Uniwind
pnpm remove uniwind
pnpm remove -D tailwindcss @tailwindcss/cli

# Reinstall NativeWind
pnpm add nativewind@^4.1.21
pnpm add -D tailwindcss@3.4.4

# Restore configs
git checkout HEAD~1 -- tailwind.config.js babel.config.js metro.config.js

# Remove global.css
rm -f src/styles/global.css

# Remove import from app entry
# Edit src/app/_layout.tsx and remove: import '../styles/global.css'

# Clean rebuild
rm -rf node_modules .expo android ios
pnpm install
pnpm prebuild
```

---

### Rollback Dependency Updates

```bash
# Restore old package.json
git checkout HEAD~1 -- package.json pnpm-lock.yaml

# Reinstall old versions
rm -rf node_modules
pnpm install
```

**Or manually downgrade specific packages:**

```bash
# Example: Rollback React Query to v4
pnpm add @tanstack/react-query@^4.36.0

# Revert code changes
git checkout HEAD~1 -- src/  # Be careful with this
```

---

### Rollback Testing Updates

```bash
# Downgrade Jest and Testing Library
pnpm add -D jest@29.7.0 jest-expo@~53.0.7
pnpm add -D @testing-library/react-native@^12.7.2

# Downgrade Maestro (if needed)
# Uninstall current version
rm -rf ~/.maestro

# Install specific older version
curl -Ls "https://get.maestro.mobile.dev/1.38.1" | bash
```

---

## Selective File Restoration

### Restore Specific Files

```bash
# Restore a specific file from a commit
git checkout <commit-hash> -- path/to/file

# Example: Restore package.json from 5 commits ago
git checkout HEAD~5 -- package.json

# Restore multiple files
git checkout HEAD~5 -- package.json babel.config.js
```

### View File at Specific Commit

```bash
# View file without restoring
git show HEAD~5:package.json

# Save to a different file to compare
git show HEAD~5:package.json > package.json.old
```

---

## Partial Rollback Strategies

### Strategy 1: Cherry-Pick Good Changes

```bash
# Create a new branch from backup
git checkout -b migration-v2 backup/pre-upgrade

# Cherry-pick only successful migrations
git cherry-pick <commit-hash-of-working-migration>

# Skip problematic ones
```

### Strategy 2: Incremental Rebuild

```bash
# Start from backup
git checkout backup/pre-upgrade
git checkout -b migration-retry

# Apply migrations one by one
# Test thoroughly after each
# Commit working changes
# Skip problematic ones for now
```

---

## Common Rollback Scenarios

### Scenario 1: App Won't Build After Migration

**Quick Fix:**
```bash
# Clean everything
rm -rf node_modules .expo android ios
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Reinstall
pnpm install
pnpm prebuild

# Try again
pnpm ios
```

**If still failing:**
```bash
# Full rollback
git reset --hard backup/pre-upgrade
pnpm install
pnpm prebuild
```

---

### Scenario 2: Tests Failing After Migration

**Quick Fix:**
```bash
# Clear Jest cache
jest --clearCache

# Reinstall
rm -rf node_modules
pnpm install

# Run tests
pnpm test
```

**If still failing:**
```bash
# Rollback testing changes only
git checkout HEAD~1 -- jest.config.js jest-setup.ts package.json
pnpm install
pnpm test
```

---

### Scenario 3: Styling Broken (Uniwind Issues)

**Quick Fix:**
```bash
# Clear Metro cache
rm -rf $TMPDIR/metro-*
expo start -c

# Rebuild
rm -rf android ios
pnpm prebuild
```

**If still broken:**
```bash
# Rollback to NativeWind (see above)
# Or fix styling issues manually
```

---

### Scenario 4: ESLint Errors Everywhere

**Quick Fix:**
```bash
# Auto-fix most issues
pnpm lint:fix

# Commit the fixes
git add .
git commit -m "fix: auto-fix eslint errors"
```

**If too many errors:**
```bash
# Rollback ESLint changes
git checkout HEAD~1 -- eslint.config.mjs .prettierrc.js package.json
pnpm install

# Restart VS Code
```

---

### Scenario 5: Env Variables Not Working

**Quick Fix:**
```bash
# Check .env file exists
cat .env

# Check values are correct
# Restart Metro
expo start -c
```

**If still not working:**
```bash
# Rollback env changes
git checkout HEAD~1 -- env.js babel.config.js package.json
git checkout HEAD~1 -- .env.development .env.staging .env.production

# Revert code changes
# Find files with process.env.EXPO_PUBLIC_*
grep -r "process.env.EXPO_PUBLIC_" src/

# Manually change back to @env imports
```

---

## Emergency Procedures

### Critical Production Issue

If you deployed to production and there's a critical issue:

**Immediate Actions:**
1. **Rollback Production Build**
   ```bash
   # Deploy previous production build
   # Use your app store's rollback feature
   # Or deploy previous IPA/APK
   ```

2. **Fix in Code**
   ```bash
   # On your machine
   git checkout production-tag-before-upgrade
   git checkout -b hotfix/critical-issue

   # Make minimal fix
   # Test thoroughly
   # Deploy hotfix
   ```

3. **Communicate**
   - Alert team
   - Post status update
   - Document issue

---

### Can't Rollback (Pushed and Deployed)

If you can't easily rollback:

**Option 1: Forward Fix**
```bash
# Fix the issue in a new commit
# Don't try to undo - fix forward
git checkout -b fix/migration-issue

# Make fixes
# Test thoroughly
# Deploy
```

**Option 2: Selective Revert**
```bash
# Revert only problematic commits
git revert <problematic-commit-hash>
git push

# Test
# Deploy
```

---

## Testing After Rollback

After any rollback, test thoroughly:

### Checklist
- [ ] App builds successfully
- [ ] Tests pass
- [ ] Linting works
- [ ] App runs on iOS
- [ ] App runs on Android
- [ ] All features work
- [ ] No console errors
- [ ] Team can pull and build

### Verification
```bash
# Clean install
rm -rf node_modules .expo android ios
pnpm install

# Lint
pnpm lint

# Test
pnpm test

# Build
pnpm prebuild
pnpm ios
pnpm android
```

---

## Preventing Future Rollback Needs

### Best Practices

1. **Commit Often**
   ```bash
   # After each successful migration
   git add .
   git commit -m "feat: complete ESLint migration"
   ```

2. **Create Backup Branch**
   ```bash
   # Before starting any migration
   git branch backup/pre-migration-$(date +%Y%m%d)
   ```

3. **Test Before Committing**
   - Run lint
   - Run tests
   - Build app
   - Manual testing

4. **Use Feature Branches**
   ```bash
   git checkout -b feature/eslint-migration
   # Work, test, commit
   # Only merge when confident
   ```

5. **Tag Stable Versions**
   ```bash
   git tag -a v8.0.0-stable -m "Stable before migration"
   git push origin v8.0.0-stable
   ```

6. **Incremental Migration**
   - Do one migration at a time
   - Test thoroughly between migrations
   - Commit after each successful migration

---

## Documentation After Rollback

If you rollback, document:

### What Went Wrong
```markdown
## Migration Rollback - [Date]

### Issue
- What failed
- Error messages
- When it was discovered

### Impact
- What was affected
- How severe
- User impact

### Rollback Performed
- What was rolled back
- How it was done
- Current state

### Root Cause
- Why it failed
- What was missed
- Lessons learned

### Next Steps
- Plan to retry?
- Alternative approach?
- Timeline
```

---

## Getting Help

If rollback isn't solving the issue:

### Community Resources
- [Expo Forums](https://forums.expo.dev/)
- [React Native Discord](https://discord.gg/react-native)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### GitHub Issues
- [Expo Issues](https://github.com/expo/expo/issues)
- [React Native Issues](https://github.com/facebook/react-native/issues)
- [@antfu/eslint-config Issues](https://github.com/antfu/eslint-config/issues)
- [Uniwind Issues](https://github.com/uni-stack/uniwind/issues)

### Professional Help
- Obytes Team
- React Native consultants
- Expo support (if using EAS)

---

## Useful Commands Reference

### Git Commands
```bash
# View history
git log --oneline --graph

# See what changed
git diff HEAD~1

# Restore file
git checkout HEAD~1 -- file.js

# Reset (DANGEROUS)
git reset --hard HEAD~5

# Revert commit
git revert <commit-hash>

# Create backup
git branch backup/$(date +%Y%m%d)
```

### Cleanup Commands
```bash
# Nuclear clean
rm -rf node_modules .expo android ios
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# Reinstall
pnpm install
pnpm prebuild
```

---

## Summary

**Key Takeaways:**
- ✅ Always create backups before major migrations
- ✅ Commit frequently during migration
- ✅ Test thoroughly at each step
- ✅ Know how to rollback before starting
- ✅ Document issues for future reference
- ✅ Don't panic - most issues are fixable

**Remember:** Rollback is always an option, but it's better to fix forward when possible.

---

## Related Documents

- `00-overview.md` - Migration overview
- `07-verification.md` - Testing checklist
- `08-summary.md` - Summary of changes

---

**Last Updated:** January 21, 2026
**Maintained By:** Obytes Team
