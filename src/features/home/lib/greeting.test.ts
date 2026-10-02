import { dayPart, firstName, greeting } from './greeting';

function at(hour: number, minute = 0): Date {
  return new Date(2026, 9, 2, hour, minute);
}

describe('dayPart', () => {
  it.each([
    [5, 0, 'morning'],
    [11, 59, 'morning'],
    [12, 0, 'afternoon'],
    [17, 59, 'afternoon'],
    [18, 0, 'evening'],
    [23, 59, 'evening'],
    [0, 0, 'evening'],
    [4, 59, 'evening'],
  ])('%i:%i is %s', (hour, minute, expected) => {
    expect(dayPart(at(hour, minute))).toBe(expected);
  });
});

describe('firstName', () => {
  it('takes the first word of a full name', () => {
    expect(firstName('  Sarah  Kavanagh ')).toBe('Sarah');
  });

  it('returns null for empty or missing names', () => {
    expect(firstName('   ')).toBeNull();
    expect(firstName(undefined)).toBeNull();
    expect(firstName(null)).toBeNull();
  });
});

describe('greeting', () => {
  it('greets by first name', () => {
    expect(greeting(at(9), 'Sarah Kavanagh')).toBe('Good morning, Sarah');
    expect(greeting(at(14), 'Sarah')).toBe('Good afternoon, Sarah');
    expect(greeting(at(20), 'Sarah')).toBe('Good evening, Sarah');
  });

  it('drops the name when there is none', () => {
    expect(greeting(at(9), undefined)).toBe('Good morning');
    expect(greeting(at(9), '')).toBe('Good morning');
  });
});
