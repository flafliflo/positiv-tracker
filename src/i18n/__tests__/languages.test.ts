import { DEFAULT_LANGUAGE, isSupportedLanguage, resolveLanguage } from '../languages';

describe('resolveLanguage', () => {
  it('picks the first device language that the app supports', () => {
    expect(resolveLanguage(['it', 'en'])).toBe('it');
    expect(resolveLanguage(['fr', 'de', 'en'])).toBe('de');
  });

  it('falls back to English when no device language is supported', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(resolveLanguage(['fr', 'es'])).toBe('en');
    expect(resolveLanguage([])).toBe('en');
  });

  it('ignores missing language codes', () => {
    expect(resolveLanguage([null, undefined, 'de'])).toBe('de');
  });

  it('prefers a stored user choice over the device language', () => {
    expect(resolveLanguage(['de'], 'it')).toBe('it');
  });

  it('ignores a stored choice that is not supported', () => {
    expect(resolveLanguage(['de'], 'fr')).toBe('de');
  });
});

describe('isSupportedLanguage', () => {
  it('accepts only the three app languages', () => {
    expect(isSupportedLanguage('de')).toBe(true);
    expect(isSupportedLanguage('it')).toBe(true);
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
  });
});
