/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  endOfLine: 'auto',
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;
