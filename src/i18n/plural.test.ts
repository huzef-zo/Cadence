import { describe, expect, it } from 'vitest';
import { makePlural, type PluralForms } from './plural';

describe('makePlural', () => {
  it('handles English plural rules (one vs other)', () => {
    const pluralEn = makePlural('en');
    const forms: PluralForms = { one: 'one', other: 'other' };

    expect(pluralEn(1, forms)).toBe('one');
    expect(pluralEn(2, forms)).toBe('other');
    expect(pluralEn(0, forms)).toBe('other');
  });

  it('handles Arabic plural rules across categories (zero, one, two, few, many, other)', () => {
    const pluralAr = makePlural('ar');
    const forms: PluralForms = {
      zero: 'zero-form',
      one: 'one-form',
      two: 'two-form',
      few: 'few-form',
      many: 'many-form',
      other: 'other-form',
    };

    expect(pluralAr(0, forms)).toBe('zero-form');
    expect(pluralAr(1, forms)).toBe('one-form');
    expect(pluralAr(2, forms)).toBe('two-form');
    expect(pluralAr(3, forms)).toBe('few-form');
    expect(pluralAr(11, forms)).toBe('many-form');
    expect(pluralAr(100, forms)).toBe('other-form');
  });

  it('falls back to other when category is missing in forms', () => {
    const pluralAr = makePlural('ar');
    const incompleteForms = { other: 'default-other' };

    expect(pluralAr(0, incompleteForms)).toBe('default-other');
    expect(pluralAr(2, incompleteForms)).toBe('default-other');
    expect(pluralAr(3, incompleteForms)).toBe('default-other');
  });
});
