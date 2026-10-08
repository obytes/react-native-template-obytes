const INTERPOLATION_REGEX = /\{\{ ?(?:- |\w+?)(, ?)?\w+ ?\}\}/;
const NESTING_REGEX = /\$t\(\w+:\w+(?:\.\w+)*\)/;

function validate(message = '') {
  if (!(message || '').trim()) {
    throw new SyntaxError('Message is Empty.');
  }
  if (typeof message !== 'string') {
    throw new TypeError('Message must be a String.');
  }
  if (
    (message.includes('{') || message.includes('}'))
    && !INTERPOLATION_REGEX.test(message)
  ) {
    throw new SyntaxError(
      'Interpolation error. See: https://www.i18next.com/misc/json-format',
    );
  }
  if (message.includes('$t(') && !NESTING_REGEX.test(message)) {
    throw new SyntaxError(
      'Nesting error. See: https://www.i18next.com/misc/json-format',
    );
  }
}

module.exports = validate;
