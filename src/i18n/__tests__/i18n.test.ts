import { createI18n } from '../i18n';

describe('createI18n', () => {
  it('translates into the requested language', () => {
    expect(createI18n('de').t('wins.title')).toBe('Meine Wins');
    expect(createI18n('it').t('wins.title')).toBe('I miei successi');
    expect(createI18n('en').t('wins.title')).toBe('My wins');
  });

  it('interpolates values', () => {
    expect(createI18n('en').t('wins.errors.textTooLong', { max: 280 })).toContain('280');
  });

  it('can switch language at runtime', async () => {
    const i18n = createI18n('en');
    await i18n.changeLanguage('it');
    expect(i18n.t('wins.form.submit')).toBe('Salva successo');
  });
});
