import { describe, expect, it } from 'vitest';
import { dirFor, resolveLanguage } from './languages';
import { en } from './en';
import { am } from './am';
import { ar } from './ar';

describe('languages', () => {
  describe('resolveLanguage', () => {
    const allLangs = ['en', 'am', 'ar'] as const;

    it('explicit enabled language wins', () => {
      expect(resolveLanguage('am', [], allLangs)).toBe('am');
      expect(resolveLanguage('ar', [], allLangs)).toBe('ar');
      expect(resolveLanguage('en', [], allLangs)).toBe('en');
    });

    it('explicit but not enabled falls back', () => {
      expect(resolveLanguage('am', ['fr-FR'], ['en'])).toBe('en');
      expect(resolveLanguage('ar', ['fr-FR'], ['en', 'am'])).toBe('en');
    });

    it("'system' with ['am-ET','en'] and all enabled returns 'am'", () => {
      expect(resolveLanguage('system', ['am-ET', 'en'], allLangs)).toBe('am');
    });

    it("'ar-SA' returns 'ar'", () => {
      expect(resolveLanguage('system', ['ar-SA'], allLangs)).toBe('ar');
    });

    it("'fr-FR' returns 'en'", () => {
      expect(resolveLanguage('system', ['fr-FR'], allLangs)).toBe('en');
    });

    it('first supported language in the list wins', () => {
      expect(resolveLanguage('system', ['fr-FR', 'ar-SA', 'am-ET'], allLangs)).toBe('ar');
    });

    it('empty list returns "en"', () => {
      expect(resolveLanguage('system', [], allLangs)).toBe('en');
    });

    it('with enabled=["en"] everything returns "en"', () => {
      expect(resolveLanguage('am', ['am-ET'], ['en'])).toBe('en');
      expect(resolveLanguage('ar', ['ar-SA'], ['en'])).toBe('en');
      expect(resolveLanguage('system', ['am-ET', 'ar-SA', 'en'], ['en'])).toBe('en');
      expect(resolveLanguage('system', [], ['en'])).toBe('en');
    });
  });

  describe('dirFor', () => {
    it("'ar' is 'rtl', 'en' and 'am' are 'ltr'", () => {
      expect(dirFor('ar')).toBe('rtl');
      expect(dirFor('en')).toBe('ltr');
      expect(dirFor('am')).toBe('ltr');
    });
  });

  describe('dictionaries key structure', () => {
    it('am and ar have exactly the same keys as en', () => {
      const enKeys = Object.keys(en).sort();
      const amKeys = Object.keys(am).sort();
      const arKeys = Object.keys(ar).sort();

      expect(amKeys).toEqual(enKeys);
      expect(arKeys).toEqual(enKeys);
    });
  });
});
