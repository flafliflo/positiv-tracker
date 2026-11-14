import { createI18n } from '../i18n';

describe('createI18n', () => {
  it('translates into the requested language', () => {
    expect(createI18n('de').t('journal.title')).toBe('Gedanken');
    expect(createI18n('it').t('journal.title')).toBe('Pensieri');
    expect(createI18n('en').t('journal.title')).toBe('Thoughts');
  });

  it('interpolates values', () => {
    expect(createI18n('en').t('wins.errors.textTooLong', { max: 280 })).toContain('280');
  });

  it('picks the plural form for the count', () => {
    const i18n = createI18n('de');
    expect(i18n.t('progress.streak.days', { count: 1 })).toBe('1 Tag');
    expect(i18n.t('progress.streak.days', { count: 3 })).toBe('3 Tage');
  });

  it('can switch language at runtime', async () => {
    const i18n = createI18n('en');
    await i18n.changeLanguage('it');
    expect(i18n.t('wins.form.submit')).toBe('Salva successo');
  });
});
