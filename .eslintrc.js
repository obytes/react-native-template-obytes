const path = require('path');

module.exports = {
  // Configuration for JavaScript files
  extends: [
    'expo', 
    'plugin:tailwindcss/recommended', 
    'prettier',
    'eslint:recommended'
  ],
  env: {
    'jest/globals': true,
    'node': true
  },
  plugins: [
    'unicorn', 
    '@typescript-eslint',
    'unused-imports',
    'tailwindcss',
    'simple-import-sort',
    'sonarjs',
    'jest'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [
    "node_modules",
    "*.config.js",
    "docs",
    "cli",
    "android",
    "ios",
    "lint-staged.config.js",
    "i18next-syntax-validation.js",
    ".eslintrc.js"
  ],
  rules: {
    'import/no-duplicates': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
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
      'error',
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
    '@typescript-eslint/array-type': 'off',
    'tailwindcss/no-custom-classname': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }
    ],
    curly: [2, 'all'],
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
      },
    ],
    'object-shorthand': 'error',
    'arrow-body-style': ["error", "as-needed"],
    'no-console': ['error', {allow: ['error']}],
    'guard-for-in': 'error',
    '@typescript-eslint/no-magic-numbers': ["error",
       { ignoreArrayIndexes: true, 
        ignoreEnums: true,
        ignore: [-1, 0, 1]
      }
    ],
    '@typescript-eslint/prefer-nullish-coalescing': "error"
  },
  overrides: [
    // Configuration for  translations files (i18next)
    {
      files: ['src/translations/*.json'],
      extends: ['plugin:i18n-json/recommended'],
      rules: {
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
        curly: [2, 'all'],
      },
    },
    {
      // Configuration for testing files
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
};
