/* eslint-disable ts/ban-ts-comment */
/* eslint-disable no-restricted-globals */
import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-expect-error
global.window = {};

// @ts-expect-error
global.window = global;
