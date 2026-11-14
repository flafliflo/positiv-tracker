import { useTranslation } from 'react-i18next';
import { Button, XStack } from 'tamagui';

import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import { useLanguage } from '@/i18n/use-language';

/** Kompakte Sprachwahl (DE / IT / EN) als Radiogruppe – für Screenreader voll beschriftet. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = useLanguage();

  return (
    <XStack role="radiogroup" aria-label={t('settings.language')} gap="1">
      {SUPPORTED_LANGUAGES.map((language) => {
        const selected = language === active;
        return (
          <Button
            key={language}
            role="radio"
            aria-checked={selected}
            aria-label={t(`languages.${language}`)}
            size="sm"
            theme={selected ? 'accent' : undefined}
            onPress={() => {
              void i18n.changeLanguage(language);
            }}
          >
            {language.toUpperCase()}
          </Button>
        );
      })}
    </XStack>
  );
}
