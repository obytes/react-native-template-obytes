const path = require('path');

module.exports = {
  // Configuration for JavaScript files
  extends: [
    '@react-native-community',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended-legacy',
  ],
  plugins: ['unicorn', 'sonarjs'],
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
    curly: [2, 'all'],
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
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
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'prettier/prettier': [
          'error',
          {
            singleQuote: true,
            endOfLine: 'auto',
          },
        ],
        'max-params': ['error', 3], // Limit the number of parameters in a function to use object instead
        'max-lines-per-function': ['error', 70],
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
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react',
                importNames: ['default'],
                message: 'No need to import React',
              },
            ],
          },
        ],
        curly: [2, 'all'],
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
