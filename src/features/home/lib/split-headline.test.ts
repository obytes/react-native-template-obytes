import { splitHeadline } from './split-headline';

describe('splitHeadline', () => {
  it('splits before " for "', () => {
    expect(splitHeadline('Ashfield Rose declares for Leopardstown')).toEqual({
      accent: 'Ashfield Rose declares',
      rest: 'for Leopardstown',
    });
  });

  it('keeps a colon with the lilac clause', () => {
    expect(splitHeadline('Race day: Leopardstown')).toEqual({
      accent: 'Race day:',
      rest: 'Leopardstown',
    });
  });

  it('splits before an em dash', () => {
    expect(splitHeadline('Big news — a new filly joins')).toEqual({
      accent: 'Big news',
      rest: '— a new filly joins',
    });
  });

  it('uses the earliest separator', () => {
    expect(splitHeadline('Update: thanks for coming')).toEqual({
      accent: 'Update:',
      rest: 'thanks for coming',
    });
    expect(splitHeadline('Tickets for July: on sale')).toEqual({
      accent: 'Tickets',
      rest: 'for July: on sale',
    });
  });

  it('makes the whole headline lilac without a separator', () => {
    expect(splitHeadline('Ashfield Rose finishes 2nd at Naas')).toEqual({
      accent: 'Ashfield Rose finishes 2nd at Naas',
      rest: '',
    });
  });

  it('ignores separators with nothing on one side', () => {
    expect(splitHeadline(': Leading colon')).toEqual({ accent: ': Leading colon', rest: '' });
    expect(splitHeadline('Trailing colon:')).toEqual({ accent: 'Trailing colon:', rest: '' });
  });

  it('does not split on "for" inside a word', () => {
    expect(splitHeadline('Forward planning at Fortune Stud').rest).toBe('');
  });
});
