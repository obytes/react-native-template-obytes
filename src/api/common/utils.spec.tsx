import { getUrlParameters, toCamelCase, toSnakeCase } from './utils';

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

describe('getUrlParameters', () => {
  it('should return null for a null URL', () => {
    const result = getUrlParameters(null);
    expect(result).toBeNull();
  });

  it('should return an empty object for a URL with no parameters', () => {
    const result = getUrlParameters('https://example.com');
    expect(result).toEqual({});
  });

  it('should return an object with a single key-value pair for a URL with one parameter', () => {
    const result = getUrlParameters('https://example.com?name=John');
    expect(result).toEqual({ name: 'John' });
  });

  it('should return an object with multiple key-value pairs for a URL with multiple parameters', () => {
    const result = getUrlParameters('https://example.com?name=John&age=30');
    expect(result).toEqual({ name: 'John', age: '30' });
  });

  it('should handle special characters in the URL parameters', () => {
    const result = getUrlParameters(
      'https://example.com?name=John%20Doe&city=New%20York'
    );
    expect(result).toEqual({ name: 'John Doe', city: 'New York' });
  });
});
