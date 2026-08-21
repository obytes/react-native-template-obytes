/**
 * ESLint rule: every module under src/features/, src/lib/ and the
 * src/components/ui/ design system must carry a spec.md (features also need a
 * decisions.md).
 *
 * The rule reports once per module rather than once per file, so a 12-file
 * feature missing a spec produces one error instead of twelve. The bookkeeping
 * lives at module scope because ESLint creates a fresh rule context per file;
 * it is reset after a period of inactivity so that a long-lived language
 * server picks up newly created spec files instead of caching forever.
 */

const fs = require('node:fs');
const path = require('node:path');

// src/components/ui is ONE module: individual primitives do not get their own
// spec, the inventory at src/components/ui/spec.md covers all of them.
const UI_MODULE = 'src/components/ui';
// These, in contrast, are namespaces: each direct subdirectory is a module.
const MODULE_PARENTS = ['src/features/', 'src/lib/'];

const RUN_IDLE_MS = 5000;

let lastSeenAt = 0;
const existsCache = new Map();
const reportedModules = new Set();

function startOfLintPass() {
  const now = Date.now();
  if (now - lastSeenAt > RUN_IDLE_MS) {
    existsCache.clear();
    reportedModules.clear();
  }
  lastSeenAt = now;
}

function exists(filePath) {
  let hit = existsCache.get(filePath);
  if (hit === undefined) {
    hit = fs.existsSync(filePath);
    existsCache.set(filePath, hit);
  }
  return hit;
}

/**
 * Map a repo-relative file path to the module directory that owns it.
 * Returns null when the file belongs to no module — notably for loose files
 * sitting directly in src/features/ or src/lib/ (e.g. src/lib/storage.tsx),
 * which are not modules of their own.
 */
function findModuleDir(relPath) {
  const p = relPath.replaceAll('\\', '/');

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

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce spec.md exists for feature/lib/ui modules' },
    schema: [],
    messages: {
      missingSpec: 'Module "{{dir}}" has testable behavior but no spec.md. Create spec.md and decisions.md.',
      missingDecisions: 'Module "{{dir}}" has spec.md but no decisions.md. Create decisions.md.',
    },
  },
  create(context) {
    const projectRoot = context.settings?.rootDir || context.cwd || process.cwd();
    const relPath = path.relative(projectRoot, context.filename);

    const moduleDir = findModuleDir(relPath);
    if (!moduleDir) {
      return {};
    }

    return {
      Program(node) {
        startOfLintPass();
        if (reportedModules.has(moduleDir)) {
          return;
        }

        const specPath = path.join(projectRoot, moduleDir, 'spec.md');
        const decisionsPath = path.join(projectRoot, moduleDir, 'decisions.md');

        if (!exists(specPath)) {
          reportedModules.add(moduleDir);
          context.report({ node, messageId: 'missingSpec', data: { dir: moduleDir } });
        }
        else if (moduleDir.startsWith('src/features/') && !exists(decisionsPath)) {
          reportedModules.add(moduleDir);
          context.report({ node, messageId: 'missingDecisions', data: { dir: moduleDir } });
        }
      },
    };
  },
};
