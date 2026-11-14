import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { isChecked } from '@/features/habits/domain/habit';
import { HabitChecklist } from '@/features/habits/ui/habit-checklist';
import type { Mood } from '@/features/journal/domain/journal-entry';
import { MOOD_EMOJI } from '@/features/journal/ui/journal-form';
import { activityByDay, currentStreak, moodByDay } from '@/features/progress/domain/stats';
import { MAX_WIN_TEXT_LENGTH } from '@/features/wins/domain/win';
import { formatNumber, formatWeekdayDate } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';
import { LoadError } from '@/ui/entry-actions';
import { AppButton, Card, ErrorMessage, IconButton, Screen, SectionTitle, StatTile, TextField } from '@/ui/kit';

import { greetingKey, promptNumberForDay } from '../domain/today';

type Props = {
  onOpenSettings: () => void;
  onOpenJournal: () => void;
};

/** Startseite: der heutige Tag auf einen Blick, mit Schnell-Eingabe. */
export function TodayScreen({ onOpenSettings, onOpenJournal }: Props) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { data, today, clock } = useAppData();

  const streak = currentStreak(new Set(activityByDay(data).keys()), today);
  const winsToday = data.wins.filter((win) => win.day === today).length;
  const moodToday = moodByDay(data.journal).get(today);
  const roundedMood = moodToday === undefined ? null : (Math.round(moodToday) as Mood);
  const habitsDone = data.habits.filter((habit) => isChecked(data.habitChecks, habit.id, today)).length;
  const stepsToday = data.health.find((healthDay) => healthDay.day === today)?.steps ?? null;
  const none = t('common.noValue');

  return (
    <Screen
      title={t(`today.greeting.${greetingKey(clock())}`)}
      subtitle={formatWeekdayDate(today, language)}
      action={<IconButton icon="settings-outline" label={t('settings.open')} onPress={onOpenSettings} bg="card" color="ink" />}
    >
      <LoadError />

      <XStack bg="brand" rounded="3xl" p="5" gap="4" items="center">
        <Text fontSize="5xl" aria-hidden>
          🔥
        </Text>
        <YStack flex={1} gap="1">
          <Text fontSize="2xl" fontWeight="800" color="onBrand">
            {streak > 0 ? t('today.streak', { count: streak }) : t('today.streakNone')}
          </Text>
          <Text fontSize="sm" color="onBrand">
            {t('today.streakHint')}
          </Text>
        </YStack>
      </XStack>

      <XStack gap="3" flexWrap="wrap">
        <StatTile testID="tile-wins" emoji="🏆" label={t('today.tiles.wins')} value={formatNumber(winsToday, language)} />
        <StatTile
          testID="tile-mood"
          emoji={roundedMood === null ? '🙂' : MOOD_EMOJI[roundedMood]}
          label={t('today.tiles.mood')}
          value={roundedMood === null ? none : t(`journal.moods.${roundedMood}`)}
        />
        <StatTile
          testID="tile-habits"
          emoji="✅"
          label={t('today.tiles.habits')}
          value={data.habits.length === 0 ? none : `${habitsDone}/${data.habits.length}`}
        />
        <StatTile
          testID="tile-steps"
          emoji="👟"
          label={t('today.tiles.steps')}
          value={stepsToday === null ? none : formatNumber(stepsToday, language)}
        />
      </XStack>

      <QuickWinCard />

      {data.habits.length > 0 ? (
        <Card>
          <SectionTitle>{t('today.habitsTitle')}</SectionTitle>
          <HabitChecklist />
        </Card>
      ) : null}

      <Card bg="accentSoft" borderColor="accentSoft">
        <Text fontSize="sm" fontWeight="700" color="accentInk">
          {t('today.prompt.title')}
        </Text>
        <Text fontSize="xl" fontWeight="700" color="accentInk">
          {t(`today.prompt.items.${promptNumberForDay(today)}`)}
        </Text>
        <XStack>
          <AppButton variant="ghost" size="sm" icon="create-outline" onPress={onOpenJournal}>
            {t('today.prompt.action')}
          </AppButton>
        </XStack>
      </Card>
    </Screen>
  );
}

/** Ein Win in einer Zeile – für den schnellen Eintrag zwischendurch. */
function QuickWinCard() {
  const { t } = useTranslation();
  const { actions } = useAppData();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const result = await actions.addWin({ text, category: 'other' });
    if (!result.ok) {
      const isValidation = result.error === 'textRequired' || result.error === 'textTooLong';
      setError(t(isValidation ? `wins.errors.${result.error}` : `common.${result.error}`, { max: MAX_WIN_TEXT_LENGTH }));
      return;
    }
    setError(null);
    setText('');
  }

  return (
    <Card>
      <SectionTitle>{t('today.quickWin.title')}</SectionTitle>
      <XStack gap="2" flexWrap="wrap" items="center">
        <YStack flex={1} minW={180}>
          <TextField
            aria-label={t('today.quickWin.label')}
            placeholder={t('today.quickWin.placeholder')}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onSubmitEditing={handleAdd}
          />
        </YStack>
        <AppButton icon="add" onPress={handleAdd}>
          {t('common.add')}
        </AppButton>
      </XStack>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </Card>
  );
}
