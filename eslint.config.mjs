// eslint.config.mjs
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';
import globals from 'globals';
import jsonPlugin from 'eslint-plugin-json';
import eslintPluginI18nJson from 'eslint-plugin-i18n-json';
import path from 'path';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import unicorn from 'eslint-plugin-unicorn';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import tailwindcss from 'eslint-plugin-tailwindcss';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

export default [
  js.configs.recommended,
  {
    // Environment and parser settings
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2015,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'ios/',
      'android/',
      'coverage/',
      '.expo/',
      '.next/',
      '**/generated/',
      '__tests__/',
      '.vscode/',
      '.expo-shared',
      'docs/',
      'cli/',
      'env.js',
      'eslint.config.mjs',
      'src/lib/env.js',
    ],
  },
  {
    // React recommended configuration
    plugins: { react: reactPlugin },
    settings: { react: { version: 'detect' } },
    rules: reactPlugin.configs.recommended.rules,
  },
  {
    // React Native 'all' configuration
    plugins: {
      'react-native': reactNativePlugin,
      prettier: eslintPluginPrettier,
      unicorn,
      '@typescript-eslint': typescriptEslintPlugin,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      tailwindcss: tailwindcss,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactNativePlugin.configs.all.rules,
      'prettier/prettier': 'warn',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['/android', '/ios'],
        },
      ],
      'max-params': ['error', 3], // Limit the number of parameters in a function to use object instead
      'max-lines-per-function': ['error', 70],
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'react/require-default-props': 'off', // Allow non-defined react props as undefined
      '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ], // Ensure `import type` is used when it's necessary
      'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
      'import/no-cycle': ['error', { maxDepth: '∞' }],
      'tailwindcss/classnames-order': [
        'warn',
        {
          officialSorting: true,
        },
      ], // Follow the same ordering as the official plugin `prettier-plugin-tailwindcss`
      'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
      'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
      '@typescript-eslint/no-unused-vars': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // JSON configuration
    files: ['**/*.json'],
    processor: jsonPlugin.processors['.json'],
    plugins: {
      json: jsonPlugin,
      'i18n-json': eslintPluginI18nJson,
    },
    rules: {
      ...jsonPlugin.configs.recommended.rules,
      'i18n-json/valid-message-syntax': [
        2,
        {
          syntax: path.resolve('./scripts/i18next-syntax-validation.js'),
        },
      ],
      'i18n-json/valid-json': 2,
      'i18n-json/sorted-keys': [
        2,
        {
          order: 'asc',
          indentSpaces: 2,
        },
      ],
      'i18n-json/identical-keys': [
        2,
        {
          filePath: path.resolve('./src/translations/en.json'),
        },
      ],
      'prettier/prettier': [
        0,
        {
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },
  {
    // Your custom rules from original .eslintrc.js
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-raw-text': 'error',
      'react-native/no-single-element-style-arrays': 'error',
    },
  },
  // Testing Library configuration
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: {
      'testing-library': testingLibraryPlugin,
    },
    rules: {
      ...testingLibraryPlugin.configs.react.rules,
      // Add any custom testing rules here
    },
  },
];
