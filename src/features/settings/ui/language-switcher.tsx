import { useTranslation } from 'react-i18next';
import { XStack } from 'tamagui';

import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import { useLanguage } from '@/i18n/use-language';
import { Chip } from '@/ui/kit';

/** Sprachwahl (DE / IT / EN) als Radiogruppe – für Screenreader voll beschriftet. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = useLanguage();

  return (
    <XStack role="radiogroup" aria-label={t('settings.language')} gap="2" flexWrap="wrap">
      {SUPPORTED_LANGUAGES.map((language) => (
        <Chip
          key={language}
          selected={language === active}
          label={t(`languages.${language}`)}
          onPress={() => {
            void i18n.changeLanguage(language);
          }}
        >
          {t(`languages.${language}`)}
        </Chip>
      ))}
    </XStack>
  );
}
