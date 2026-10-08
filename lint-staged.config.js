module.exports = {
  '**/*.{js,jsx,ts,tsx}': filenames => [
    `eslint --fix ${filenames
      .map(filename => `"${filename}"`)
      .join(' ')}`,
  ],
  '**/*.json': filenames => [
    `eslint --fix ${filenames
      .map(filename => `"${filename}"`)
      .join(' ')}`,
  ],
};
