import { SUPPORTED_LANGUAGES } from '../languages';
import { resources } from '../resources';

type Tree = { [key: string]: string | Tree };

/** Macht aus { a: { b: 'x' } } die Liste ['a.b']. */
function flattenKeys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

function getValue(tree: Tree, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => (node as Tree | undefined)?.[key], tree);
}

describe('translations', () => {
  const keysByLanguage = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((lang) => [lang, flattenKeys(resources[lang].translation).sort()]),
  );
  const allKeys = [...new Set(Object.values(keysByLanguage).flat())].sort();

  it('supports exactly German, Italian and English', () => {
    expect([...SUPPORTED_LANGUAGES].sort()).toEqual(['de', 'en', 'it']);
  });

  it.each(SUPPORTED_LANGUAGES)('%s contains every translation key', (lang) => {
    expect(keysByLanguage[lang]).toEqual(allKeys);
  });

  it.each(SUPPORTED_LANGUAGES)('%s has no empty translations', (lang) => {
    const empty = allKeys.filter((key) => {
      const value = getValue(resources[lang].translation, key);
      return typeof value !== 'string' || value.trim() === '';
    });
    expect(empty).toEqual([]);
  });
});
