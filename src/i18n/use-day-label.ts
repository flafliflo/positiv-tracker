import { useTranslation } from 'react-i18next';

import { useAppData } from '@/app-data/app-data-provider';
import { addDays } from '@/shared/day';

import { formatDay } from './format';
import { useLanguage } from './use-language';

/** Liefert eine Funktion, die einen Tag menschlich beschriftet: „Heute", „Gestern" oder das Datum. */
export function useDayLabel(): (day: string) => string {
  const { t } = useTranslation();
  const language = useLanguage();
  const { today } = useAppData();

  return (day) => {
    if (day === today) return t('common.today');
    if (day === addDays(today, -1)) return t('common.yesterday');
    return formatDay(day, language);
  };
}
