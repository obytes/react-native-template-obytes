# React Native Template Upgrade Guide - Overview

## Introduction

This comprehensive upgrade guide will help you modernize your React Native template (currently v8.0.0) with the latest tools, libraries, and best practices. The upgrade is split into 6 major areas, each with its own detailed guide.

## Upgrade Areas

### 1. ESLint Setup Migration
**File:** `01-eslint-migration.md`

Migrate from your current ESLint setup to @antfu/eslint-config:
- Remove Prettier, use ESLint Stylistic for formatting
- Modern flat config (ESLint 9+)
- Opinionated, auto-configured setup
- Simpler, faster, more maintainable

**Impact:** High - Changes entire linting and formatting workflow
**Estimated Time:** 30-45 minutes

---

### 2. Expo SDK 54 Upgrade
**File:** `02-expo-sdk-54-upgrade.md`

Upgrade from Expo SDK 53 to SDK 54:
- React Native 0.81 + React 19.1
- Faster iOS builds (precompiled XCFrameworks)
- Reanimated v4 (New Architecture support)
- Breaking changes in expo-file-system, notifications, vector-icons

**Impact:** High - Major framework upgrade
**Estimated Time:** 1-2 hours (includes testing)

---

### 3. Environment Variables Simplification
**File:** `03-environment-variables.md`

Simplify environment variable management:
- Single `.env` file instead of multiple environment files
- Adopt Expo's `EXPO_PUBLIC_*` prefix convention
- Simplified `env.js` validation
- Manage multiple environments via EAS Secrets or CI/CD

**Impact:** Medium - Changes how env vars are accessed
**Estimated Time:** 30 minutes

---

### 4. Dependency Updates
**File:** `04-dependency-updates.md`

Update all major dependencies to latest versions:
- React Query v5 (with breaking changes)
- Zustand v5 (stable, best practices)
- React Hook Form, Axios, Zod
- All UI libraries and utilities

**Impact:** Medium - May require code changes for breaking changes
**Estimated Time:** 45-60 minutes

---

### 5. NativeWind → Uniwind Migration
**File:** `05-uniwind-migration.md`

Migrate to Uniwind for better performance:
- 2.5x faster than NativeWind
- Build-time style compilation
- Tailwind CSS v4 (CSS-first approach)
- Platform selectors built-in

**Impact:** High - Changes styling approach
**Estimated Time:** 1-1.5 hours

---

### 6. Testing Updates
**File:** `06-testing-updates.md`

Update testing infrastructure:
- Jest & jest-expo for SDK 54
- Latest Testing Library
- Maestro CLI 2.0+ (requires Java 17)

**Impact:** Low - Mostly version updates
**Estimated Time:** 20-30 minutes

---

## Additional Documents

### Verification & Testing
**File:** `07-verification.md`

Comprehensive testing checklist after upgrades:
- Clean environment
- Run linting, type-checking, tests
- Build and test on all platforms
- Verify all features work

---

### Summary of Changes
**File:** `08-summary.md`

Quick reference of all changes:
- Files created/modified/deleted
- Dependency changes
- Script changes
- Configuration changes

---

### Rollback Plan
**File:** `09-rollback-plan.md`

What to do if something goes wrong:
- Full rollback via git
- Partial rollback per section
- Common issues and solutions

---

## Recommended Approach

### Option 1: All-at-Once (Recommended for New Projects)
Do all upgrades in sequence, then test everything together.

**Pros:**
- Get everything done at once
- Avoid multiple testing cycles
- Cleaner git history

**Cons:**
- Harder to debug if issues arise
- More risky for production apps

**Time Required:** 4-6 hours

---

### Option 2: Incremental (Recommended for Production Apps)
Do one upgrade at a time, test thoroughly, then move to the next.

**Pros:**
- Easier to isolate issues
- Less risky
- Can pause/resume anytime

**Cons:**
- Takes longer overall
- More commits/PRs to manage

**Time Required:** 1-2 days (spread out)

---

### Option 3: Pick and Choose
Only do the upgrades you need.

For example, you might want:
- ✅ ESLint migration (cleaner setup)
- ✅ Dependency updates (security)
- ❌ Skip Expo SDK 54 (if not ready)
- ❌ Skip Uniwind (if NativeWind works fine)

---

## Prerequisites

Before starting any upgrade:

1. **Clean Git State**
   ```bash
   git status  # Should show clean working tree
   git checkout -b upgrade/react-native-template
   ```

2. **Backup**
   ```bash
   # Create a backup branch
   git branch backup/pre-upgrade
   ```

3. **System Requirements**
   - Node.js 20 LTS
   - pnpm 10+
   - Java 17+ (for Maestro)
   - Latest Xcode (for iOS)
   - Latest Android Studio (for Android)

4. **Time & Resources**
   - Set aside uninterrupted time
   - Have good internet connection (for downloads)
   - Be ready to test on physical devices if needed

---

## Order of Execution

We recommend following this order:

1. **ESLint Migration** (01) - Get linting working first
2. **Environment Variables** (03) - Simple, independent change
3. **Expo SDK 54** (02) - Major upgrade, do early
4. **Dependency Updates** (04) - Update after Expo SDK
5. **Uniwind Migration** (05) - Styling last (easier to test visually)
6. **Testing Updates** (06) - Update testing after everything else
7. **Verification** (07) - Comprehensive testing
8. **Summary** (08) - Review changes

---

## Getting Help

If you encounter issues:

1. **Check the Rollback Plan** (`09-rollback-plan.md`)
2. **Search the official docs** (links in each guide)
3. **Check GitHub Issues** for the specific library
4. **Ask in Discord/Slack** channels for Expo/React Native

---

## Post-Upgrade

After completing all upgrades:

- [ ] Review the Summary document
- [ ] Complete the Verification checklist
- [ ] Update your project README
- [ ] Document any custom changes you made
- [ ] Share learnings with your team
- [ ] Consider creating a blog post or internal wiki

---

## Good Luck! 🚀

Take your time, test thoroughly, and don't hesitate to rollback if needed. The goal is a more maintainable, performant, and modern React Native template.

---

**Last Updated:** January 21, 2026
**Template Version:** 8.0.0 → 8.1.0+
**Author:** Obytes Team
