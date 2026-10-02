import { countWords, readMinutes, readTimeLabel } from '@/features/paddock/lib/read-time';

describe('readMinutes', () => {
  it('has a minimum of one minute', () => {
    expect(readMinutes(0)).toBe(1);
    expect(readMinutes(1)).toBe(1);
  });
  it('rounds up at 200 wpm', () => {
    expect(readMinutes(200)).toBe(1);
    expect(readMinutes(201)).toBe(2);
    expect(readMinutes(600)).toBe(3);
    expect(readMinutes(601)).toBe(4);
  });
});

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('  one two\nthree  ')).toBe(3);
    expect(countWords('   ')).toBe(0);
  });
});

describe('readTimeLabel', () => {
  it('prefers wordCount, falls back to body, else null', () => {
    expect(readTimeLabel({ wordCount: 450 })).toBe('3 min read');
    expect(readTimeLabel({ body: 'a b c' })).toBe('1 min read');
    expect(readTimeLabel({})).toBeNull();
    expect(readTimeLabel({ wordCount: null, body: null })).toBeNull();
  });
});
