const path = require('path');

module.exports = {
  // Configuration for JavaScript files
  extends: ['@react-native-community', 'plugin:prettier/recommended'],
  plugins: ['unicorn'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: ['/android', '/ios'],
      },
    ],
  },
  overrides: [
    // Configuration for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
      plugins: [
        '@typescript-eslint',
        'unused-imports',
        'tailwindcss',
        'simple-import-sort',
      ],
      extends: [
        'plugin:tailwindcss/recommended',
        '@react-native-community',
        'plugin:prettier/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
          },
        ],
        'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
        'react/require-default-props': 'off', // Allow non-defined react props as undefined
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'tailwindcss/classnames-order': [
          'warn',
          {
            officialSorting: true,
          },
        ], // Follow the same ordering as the official plugin `prettier-plugin-tailwindcss`
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
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
      },
    },
  ],
};
