/**
 * Design V2 token guards (S13-01 §1).
 *
 * 1. `colors.js` (JS-side palette) must mirror every `--color-*` token in
 *    `src/global.css` `@theme`, value for value.
 * 2. No raw hex / rgb() colours in `src/**\/*.ts(x)` outside the allow-list:
 *    use a className token, or import from `@/components/ui/colors`.
 * 3. No deleted legacy palette classes (Digital Estate `blue-*`, `pink-*`,
 *    `green-*`, `beige`, `text-dark/light`), Tailwind default greys/violets
 *    standing in for brand colour, or `dark:` variants (the app is light-only).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import colors from './colors';

const SRC = path.resolve(__dirname, '../..');
const GLOBAL_CSS = path.join(SRC, 'global.css');

// Files allowed to contain raw colour literals. Each carries a comment saying why.
const HEX_ALLOWLIST = new Set([
  'components/ui/colors.js',
  'components/ui/design-tokens.test.ts',
  'features/onboarding/components/cover.tsx',
  'components/ui/list.tsx',
  'components/ui/icons/language.tsx',
  // Verbatim port of the waitlist pattern palette (rionna-ireland tiles.tsx); some
  // tile colours (#a6b999) have no app token, and keeping it identical to web matters.
  'components/brand/pattern/tile-data.ts',
]);

// JS-only keys in colors.js with no `--color-*` token (not className colours).
const JS_ONLY_KEYS = new Set(['white', 'scrim', 'medal']);

function readThemeColors(): Record<string, string> {
  const css = fs.readFileSync(GLOBAL_CSS, 'utf8');
  const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!theme)
    throw new Error('No @theme block in global.css');
  const out: Record<string, string> = {};
  for (const m of theme[1].matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g))
    out[m[1]] = m[2].trim().toLowerCase();
  return out;
}

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
}

function flattenColors(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors as Record<string, unknown>)) {
    if (JS_ONLY_KEYS.has(key))
      continue;
    if (typeof value === 'string') {
      out[kebab(key)] = value.toLowerCase();
    }
    else {
      for (const [shade, v] of Object.entries(value as Record<string, string>))
        out[`${kebab(key)}-${shade}`] = v.toLowerCase();
    }
  }
  return out;
}

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__snapshots__' && entry.name !== 'node_modules')
        sourceFiles(full, acc);
    }
    else if (/\.(?:tsx?|js)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function offending(pattern: RegExp, skip: Set<string> = new Set()): string[] {
  const hits: string[] = [];
  for (const file of sourceFiles(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join('/');
    if (skip.has(rel))
      continue;
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (pattern.test(line))
        hits.push(`${rel}:${i + 1}: ${line.trim()}`);
    });
  }
  return hits;
}

describe('design tokens', () => {
  it('colors.js mirrors every --color-* token in global.css', () => {
    const css = readThemeColors();
    const js = flattenColors();
    expect(Object.keys(css).length).toBeGreaterThan(20);
    expect(js).toEqual(css);
  });

  it('has no raw hex or rgb() colours in src outside the allow-list', () => {
    const hits = offending(/#[0-9a-f]{3,8}\b|rgba?\(/i, HEX_ALLOWLIST);
    expect(hits).toEqual([]);
  });

  it('uses no deleted legacy palette classes or dark: variants', () => {
    const legacy = new RegExp(
      [
        // deleted Digital Estate palettes
        String.raw`(?<![\w-])[a-z]+-(?:text-dark|text-light|beige|(?:blue|green|pink)-\d+)(?:/\d+)?(?![\w-])`,
        // Tailwind default palettes standing in for brand colour
        String.raw`(?<![\w-])(?:bg|text|border|fill|stroke|ring|shadow|divide|placeholder)-(?:neutral|charcoal|gray|grey|slate|zinc|stone|violet|purple|rose|red|emerald)-\d+`,
        String.raw`(?<![\w-])(?:bg|text|border|fill|stroke|shadow)-black(?![\w-])`,
        // light-only: no dark variants
        String.raw`(?<![\w-])dark:[a-z]`,
      ].join('|'),
    );
    const hits = offending(legacy, new Set(['components/ui/design-tokens.test.ts']));
    expect(hits).toEqual([]);
  });

  it('uses weight-specific Jakarta families, never fontWeight classes or props', () => {
    // iOS can't map fontWeight onto single-weight custom families: use
    // font-sans-medium|semibold|bold (global.css) or FONT_FAMILY (ui/fonts.ts).
    const classHits = offending(
      /(?<![\w-])font-(?:medium|semibold|bold|extrabold)(?![\w-])/,
      new Set(['components/ui/design-tokens.test.ts']),
    );
    expect(classHits).toEqual([]);
    const propHits = offending(
      /fontWeight\s*[:=]/,
      // SVG <text> in the language flag icon is not Jakarta text.
      new Set(['components/ui/design-tokens.test.ts', 'components/ui/icons/language.tsx']),
    );
    expect(propHits).toEqual([]);
  });
});
