module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/setup.ts',
  ],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/docs/**',
    '!**/cli/**',
  ],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transformIgnorePatterns: [
    `node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))`,
  ],
  coverageReporters: ['text', 'clover'],
  reporters: [['github-actions', { silent: false }], 'summary'],
  coverageDirectory: '<rootDir>/reports',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
