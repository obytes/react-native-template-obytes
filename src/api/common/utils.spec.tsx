import { toCamelCase, toSnakeCase } from './utils';

describe('utils', () => {
  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      const obj = {
        foo_bar: 'foo',
        bar_baz: 'bar',
      };
      const expected = {
        fooBar: 'foo',
        barBaz: 'bar',
      };
      expect(toCamelCase(obj)).toEqual(expected);
    });

    it('should convert to camelCase only snake_case keys', () => {
      const obj = {
        foo_bar: 'foo',
        bar_baz: 'bar',
        fooBar: 'foo',
        barBaz: 'bar',
      };
      const expected = {
        fooBar: 'foo',
        barBaz: 'bar',
      };
      expect(toCamelCase(obj)).toEqual(expected);
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      const obj = {
        fooBar: 'foo',
        barBaz: 'bar',
      };
      const expected = {
        foo_bar: 'foo',
        bar_baz: 'bar',
      };
      expect(toSnakeCase(obj)).toEqual(expected);
    });

    it('should convert to snake_case only camelCase keys', () => {
      const obj = {
        fooBar: 'foo',
        barBaz: 'bar',
        foo_bar: 'foo',
        bar_baz: 'bar',
      };
      const expected = {
        foo_bar: 'foo',
        bar_baz: 'bar',
      };
      expect(toSnakeCase(obj)).toEqual(expected);
    });
  });
});
