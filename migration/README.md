# React Native Template Migration Guide

Welcome to the comprehensive migration guide for upgrading your React Native template from v8.0.0 to v8.1.0+.

## 📚 Documentation Structure

### Start Here
- **[00-overview.md](./00-overview.md)** - Read this first! Overview of all migrations, recommended approaches, and prerequisites

### Migration Guides (Follow in Order)

1. **[01-eslint-migration.md](./01-eslint-migration.md)**
   - Migrate to @antfu/eslint-config
   - Remove Prettier, use ESLint Stylistic
   - ⏱️ 30-45 minutes | 🔴 High Impact

2. **[02-expo-sdk-54-upgrade.md](./02-expo-sdk-54-upgrade.md)**
   - Upgrade from Expo SDK 53 to 54
   - React Native 0.81 + React 19.1
   - ⏱️ 1-2 hours | 🔴 High Impact

3. **[03-environment-variables.md](./03-environment-variables.md)**
   - Simplify to single .env file
   - Use EXPO_PUBLIC_* prefix
   - ⏱️ 30 minutes | 🟡 Medium Impact

4. **[04-dependency-updates.md](./04-dependency-updates.md)**
   - Update React Query, Zustand, and all libraries
   - Latest versions for security and features
   - ⏱️ 45-60 minutes | 🟡 Medium Impact

5. **[05-uniwind-migration.md](./05-uniwind-migration.md)**
   - Migrate from NativeWind to Uniwind
   - 2.5x performance improvement
   - ⏱️ 1-1.5 hours | 🔴 High Impact

6. **[06-testing-updates.md](./06-testing-updates.md)**
   - Update Jest and Maestro
   - SDK 54 compatible testing
   - ⏱️ 20-30 minutes | 🟢 Low Impact

### After Migration

7. **[07-verification.md](./07-verification.md)**
   - Comprehensive testing checklist
   - Verify everything works
   - ⏱️ 2-3 hours | 🔴 Critical

8. **[08-summary.md](./08-summary.md)**
   - Quick reference of all changes
   - Files modified/created/deleted
   - Dependency changes

9. **[09-rollback-plan.md](./09-rollback-plan.md)**
   - What to do if something goes wrong
   - Full and partial rollback strategies
   - Emergency procedures

---

## 🚀 Quick Start

### Option 1: All-at-Once (Recommended for New Projects)

```bash
# 1. Create backup
git branch backup/pre-upgrade

# 2. Create feature branch
git checkout -b upgrade/react-native-template

# 3. Follow guides 01 through 06 in order
# 4. Run verification (07)
# 5. Merge to main
```

**Time Required:** 4-6 hours
**Best For:** New projects, non-production apps

---

### Option 2: Incremental (Recommended for Production)

```bash
# 1. Create backup
git branch backup/pre-upgrade

# 2. Do one migration at a time
git checkout -b feature/eslint-migration
# Follow guide 01, test thoroughly, merge

git checkout -b feature/expo-upgrade
# Follow guide 02, test thoroughly, merge

# ... continue for each migration
```

**Time Required:** 1-2 days (spread out)
**Best For:** Production apps, large teams

---

### Option 3: Pick and Choose

Only do the migrations you need:

- ✅ **Must Have:** Expo SDK 54 (02), Dependency Updates (04)
- 🎯 **Recommended:** ESLint (01), Uniwind (05)
- 📝 **Nice to Have:** Env Variables (03), Testing (06)

---

## 📋 Prerequisites

Before starting:

```bash
# 1. Clean git state
git status  # Should show clean working tree

# 2. Check versions
node --version  # Should be 20 LTS
pnpm --version  # Should be 10+

# 3. Backup your work
git branch backup/pre-upgrade
```

**System Requirements:**
- Node.js 20 LTS
- pnpm 10+
- Java 17+ (for Maestro)
- Latest Xcode (for iOS)
- Latest Android Studio (for Android)

---

## 🎯 What You'll Get

### Performance Improvements
- ⚡ **2.5x faster styling** (Uniwind)
- ⚡ **Faster iOS builds** (SDK 54)
- ⚡ **Faster test execution** (Maestro 2.0)

### Developer Experience
- ✨ **Simpler linting** (one tool instead of two)
- ✨ **Better env vars** (standard EXPO_PUBLIC_*)
- ✨ **Modern dependencies** (latest versions)
- ✨ **Cleaner codebase** (auto-formatting, import sorting)

### Maintenance
- 🛡️ **Security patches** (latest dependencies)
- 🛡️ **Bug fixes** (Expo SDK 54, React Native 0.81)
- 🛡️ **Future-proof** (modern tooling)

---

## 📖 Reading Guide

### If You're New to Migrations
1. Read `00-overview.md` thoroughly
2. Read `09-rollback-plan.md` (so you know your safety net)
3. Start with `01-eslint-migration.md`
4. Take breaks between migrations
5. Test thoroughly at each step

### If You're Experienced
1. Skim `00-overview.md`
2. Jump to specific migration guides
3. Use `08-summary.md` as quick reference
4. Keep `09-rollback-plan.md` handy

### If You Have Issues
1. Check "Common Issues" in each guide
2. Review `09-rollback-plan.md`
3. Search GitHub Issues (links in each guide)
4. Ask for help (Discord, Forums)

---

## 🔗 Useful Links

### Official Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [@antfu/eslint-config](https://github.com/antfu/eslint-config)
- [Uniwind](https://uniwind.dev/)
- [TanStack Query](https://tanstack.com/query)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Discord](https://discord.gg/react-native)
- [Expo Forums](https://forums.expo.dev/)

### Tools
- [Expo Doctor](https://docs.expo.dev/more/expo-cli/#doctor)
- [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)

---

## ⚠️ Important Notes

### Before You Start
- ✅ Backup your work (`git branch backup/pre-upgrade`)
- ✅ Commit frequently during migration
- ✅ Test thoroughly at each step
- ✅ Read the overview first
- ✅ Have rollback plan ready

### During Migration
- 🔴 Never rush through migrations
- 🔴 Always test before moving to next migration
- 🔴 Document any issues you encounter
- 🔴 Ask for help if stuck

### After Migration
- ✅ Run full verification (guide 07)
- ✅ Test on all platforms
- ✅ Update team documentation
- ✅ Share learnings with team

---

## 📊 Migration Checklist

Track your progress:

- [ ] Read overview (00)
- [ ] Create backup branch
- [ ] ESLint migration (01)
- [ ] Expo SDK 54 upgrade (02)
- [ ] Environment variables (03)
- [ ] Dependency updates (04)
- [ ] Uniwind migration (05)
- [ ] Testing updates (06)
- [ ] Verification (07)
- [ ] Review summary (08)
- [ ] All tests pass
- [ ] All platforms build
- [ ] Team notified
- [ ] Documentation updated

---

## 🆘 Need Help?

### Stuck on a Migration?
1. Check "Common Issues" section in that guide
2. Review `09-rollback-plan.md`
3. Search GitHub Issues for the specific library
4. Ask in Discord/Forums (links above)

### Critical Production Issue?
See **Emergency Procedures** in `09-rollback-plan.md`

### Want to Contribute?
Found an issue or have improvements? Open a PR!

---

## 📝 Notes

- Each guide is self-contained and can be read independently
- Links between guides help you navigate related topics
- Code examples are tested and production-ready
- Commands are for macOS/Linux (Windows users may need adjustments)

---

## 🎉 Good Luck!

Take your time, test thoroughly, and don't hesitate to rollback if needed. The goal is a more maintainable, performant, and modern React Native template.

**Questions?** Check the guides or ask in the community channels!

---

**Last Updated:** January 21, 2026
**Template Version:** 8.0.0 → 8.1.0+
**Maintained By:** Obytes Team
