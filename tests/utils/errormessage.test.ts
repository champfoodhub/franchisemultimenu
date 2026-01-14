import { ErrorMessage } from '../../src/utils/errormessage';

describe('ErrorMessage', () => {
  it('should have a TOKEN_MISSING property', () => {
    expect(ErrorMessage.TOKEN_MISSING).toBe('Token missing');
  });
});
