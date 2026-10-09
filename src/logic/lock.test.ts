import { describe, expect, it } from 'vitest';
import { generateSalt, hashPin, isValidPin, verifyPin } from './lock';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from './config';

describe('pin hashing (4.9)', () => {
  it('verifies a correct PIN and rejects a wrong one', async () => {
    const salt = generateSalt();
    const hash = await hashPin('1234', salt);
    expect(await verifyPin('1234', salt, hash)).toBe(true);
    expect(await verifyPin('4321', salt, hash)).toBe(false);
  });

  it('uses a unique salt per call', () => {
    expect(generateSalt()).not.toBe(generateSalt());
  });

  it('validates PIN length of 4 to 6 digits', () => {
    expect(isValidPin('1234', PIN_MIN_LENGTH, PIN_MAX_LENGTH)).toBe(true);
    expect(isValidPin('123456', PIN_MIN_LENGTH, PIN_MAX_LENGTH)).toBe(true);
    expect(isValidPin('123', PIN_MIN_LENGTH, PIN_MAX_LENGTH)).toBe(false);
    expect(isValidPin('1234567', PIN_MIN_LENGTH, PIN_MAX_LENGTH)).toBe(false);
    expect(isValidPin('12a4', PIN_MIN_LENGTH, PIN_MAX_LENGTH)).toBe(false);
  });
});
