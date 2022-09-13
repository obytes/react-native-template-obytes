module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => [
    `yarn eslint --fix ${filenames.join(' ')}`,
  ],
  '**/*.{ts,tsx}': () => [`tsc --noEmit`],
  '**/*.(md|json)': (filenames) =>
    `yarn prettier --write ${filenames.join(' ')}`,
  'src/translations/*.(json)': (filenames) => [
    `yarn eslint --fix ${filenames.join(' ')}`,
  ],
};
