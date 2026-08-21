#!/usr/bin/env node
/**
 * Spec drift check.
 *
 * Every module under src/features/<name>/, src/lib/<name>/ and the
 * src/components/ui/ design system must carry a spec.md (and, for features,
 * a decisions.md). This script looks at what changed and fails when a changed
 * module has no spec.
 *
 * Usage:
 *   node scripts/check-specs.js                 # staged changes, falling back
 *                                               # to the working tree vs HEAD
 *   node scripts/check-specs.js --base <ref>    # everything changed since <ref>
 *                                               # (used by CI on pull requests)
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// src/components/ui is ONE module: individual primitives do not get their own
// spec, the inventory at src/components/ui/spec.md covers all of them.
const UI_MODULE = 'src/components/ui';
// These, in contrast, are namespaces: each direct subdirectory is a module.
const MODULE_PARENTS = ['src/features/', 'src/lib/'];

function parseArgs(argv) {
  let base = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base') {
      base = argv[++i];
    }
    else if (arg.startsWith('--base=')) {
      base = arg.slice('--base='.length);
    }
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (base !== null && !base) {
    throw new Error('--base requires a git ref');
  }
  return { base };
}

function git(args, cwd) {
  // core.quotepath=false + -z keeps non-ASCII paths and paths with spaces
  // readable instead of C-quoted.
  const out = execFileSync('git', ['-c', 'core.quotepath=false', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return out.split('\0').filter(Boolean);
}

function repoRoot() {
  return git(['rev-parse', '--show-toplevel'], __dirname)[0].trim();
}

/**
 * Map a repo-relative file path to the module directory that owns it.
 * Returns null when the file belongs to no module — notably for loose files
 * sitting directly in src/features/ or src/lib/ (e.g. src/lib/storage.tsx),
 * which are not modules of their own.
 */
function getModuleDir(file) {
  const p = file.replaceAll('\\', '/');

  if (p.startsWith(`${UI_MODULE}/`)) {
    return UI_MODULE;
  }

  for (const base of MODULE_PARENTS) {
    if (!p.startsWith(base)) {
      continue;
    }
    const rest = p.slice(base.length);
    const slash = rest.indexOf('/');
    // No slash left => a loose file directly inside src/features/ or src/lib/.
    if (slash <= 0) {
      return null;
    }
    return base + rest.slice(0, slash);
  }

  return null;
}

/**
 * Collect the changed files to inspect.
 * --diff-filter=ACMR skips deletions, so removing a feature folder (which also
 * removes its spec.md) does not report that spec as missing.
 */
function collectChanges(root, base) {
  if (base) {
    return {
      label: `changes since ${base}`,
      files: git(['diff', '-z', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`], root),
    };
  }

  // Decide the mode on the unfiltered staged set, so that a commit which only
  // stages deletions is still treated as "staged" rather than falling through
  // to an unrelated dirty working tree.
  if (git(['diff', '--cached', '-z', '--name-only'], root).length > 0) {
    return {
      label: 'staged changes',
      files: git(['diff', '--cached', '-z', '--name-only', '--diff-filter=ACMR'], root),
    };
  }

  // Nothing staged: fall back to the working tree so that running the check
  // before staging (as the docs tell you to) is not a silent no-op.
  return {
    label: 'working tree vs HEAD',
    files: [
      ...git(['diff', '-z', '--name-only', '--diff-filter=ACMR', 'HEAD'], root),
      ...git(['ls-files', '-z', '--others', '--exclude-standard'], root),
    ],
  };
}

function main() {
  const { base } = parseArgs(process.argv.slice(2));
  const root = repoRoot();
  const { label, files } = collectChanges(root, base);

  const modules = new Set();
  for (const file of files) {
    const mod = getModuleDir(file);
    if (mod) {
      modules.add(mod);
    }
  }

  const problems = [];
  for (const mod of [...modules].sort()) {
    if (!fs.existsSync(path.join(root, mod, 'spec.md'))) {
      problems.push({
        file: `${mod}/spec.md`,
        message: `${mod} changed but has no spec.md — describe what the module does today`,
      });
    }
    if (mod.startsWith('src/features/') && !fs.existsSync(path.join(root, mod, 'decisions.md'))) {
      problems.push({
        file: `${mod}/decisions.md`,
        message: `${mod} changed but has no decisions.md — record the trade-offs behind it`,
      });
    }
  }

  if (problems.length > 0) {
    console.error(`check-specs: ${problems.length} problem(s) in ${label}\n`);
    for (const problem of problems) {
      console.error(`  ✖ ${problem.message}`);
      if (process.env.GITHUB_ACTIONS === 'true') {
        console.error(`::error file=${problem.file}::${problem.message}`);
      }
    }
    console.error('\nSee .templates/spec.md for the expected shape.');
    process.exit(1);
  }

  console.log(`check-specs: ${modules.size} module(s) checked in ${label} — all specs present.`);
}

try {
  main();
}
catch (error) {
  console.error(`check-specs: ${error.message}`);
  process.exit(1);
}
