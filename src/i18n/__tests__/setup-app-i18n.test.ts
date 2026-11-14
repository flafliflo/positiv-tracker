import { LANGUAGE_STORAGE_KEY, setupAppI18n } from '../setup-app-i18n';

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe('setupAppI18n', () => {
  it('starts immediately in the device language', () => {
    const { i18n } = setupAppI18n({ deviceLanguageCodes: ['it', 'en'], storage: createStorage() });

    expect(i18n.language).toBe('it');
  });

  it('falls back to English for unsupported device languages', () => {
    const { i18n } = setupAppI18n({ deviceLanguageCodes: ['fr'], storage: createStorage() });

    expect(i18n.language).toBe('en');
  });

  it('applies the language the user chose earlier once storage has loaded', async () => {
    const storage = createStorage({ [LANGUAGE_STORAGE_KEY]: 'de' });
    const { i18n, ready } = setupAppI18n({ deviceLanguageCodes: ['it'], storage });

    await ready;

    expect(i18n.language).toBe('de');
  });

  it('ignores an unsupported stored language', async () => {
    const storage = createStorage({ [LANGUAGE_STORAGE_KEY]: 'fr' });
    const { i18n, ready } = setupAppI18n({ deviceLanguageCodes: ['it'], storage });

    await ready;

    expect(i18n.language).toBe('it');
  });

  it('remembers a language switch', async () => {
    const storage = createStorage();
    const { i18n, ready } = setupAppI18n({ deviceLanguageCodes: ['en'], storage });
    await ready;

    await i18n.changeLanguage('it');

    expect(storage.data.get(LANGUAGE_STORAGE_KEY)).toBe('it');
  });

  it('keeps working when storage is unavailable', async () => {
    const storage = {
      getItem: async () => {
        throw new Error('blocked');
      },
      setItem: async () => {
        throw new Error('blocked');
      },
    };
    const { i18n, ready } = setupAppI18n({ deviceLanguageCodes: ['de'], storage });

    await expect(ready).resolves.toBeUndefined();
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });
});
