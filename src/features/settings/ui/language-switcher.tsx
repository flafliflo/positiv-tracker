import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import { useLanguage } from '@/i18n/use-language';
import { Segment, Segmented } from '@/ui/kit';

/** Sprachwahl (Deutsch / Italiano / English) als Umschaltleiste. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = useLanguage();

  return (
    <Segmented label={t('settings.language')}>
      {SUPPORTED_LANGUAGES.map((language) => (
        <Segment
          key={language}
          selected={language === active}
          onPress={() => {
            void i18n.changeLanguage(language);
          }}
        >
          {t(`languages.${language}`)}
        </Segment>
      ))}
    </Segmented>
  );
}
