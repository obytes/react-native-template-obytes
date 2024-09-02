import { storage } from '../storage';
import { getLanguage } from './utils';

jest.mock('../storage', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

describe('getLanguage', () => {
  it('should call storage.getString with LOCAL', () => {
    getLanguage();
    expect(storage.getString).toHaveBeenCalledWith('local');
  });
});
