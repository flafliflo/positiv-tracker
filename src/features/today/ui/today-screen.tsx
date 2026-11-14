import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { isChecked } from '@/features/habits/domain/habit';
import { HabitChecklist } from '@/features/habits/ui/habit-checklist';
import type { Mood } from '@/features/journal/domain/journal-entry';
import { MOOD_ICON } from '@/features/journal/ui/journal-form';
import { activityByDay, currentStreak, moodByDay } from '@/features/progress/domain/stats';
import { MAX_WIN_TEXT_LENGTH } from '@/features/wins/domain/win';
import { formatDay, formatNumber, formatWeekdayDate, formatWeekdayShort } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';
import { lastDays } from '@/shared/day';
import { LoadError } from '@/ui/entry-actions';
import { AppButton, Card, ErrorMessage, Group, Icon, IconButton, Screen, Section, TextField, ValueRow } from '@/ui/kit';

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

  const activity = activityByDay(data);
  const streak = currentStreak(new Set(activity.keys()), today);
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
      action={<IconButton icon="cog-outline" label={t('settings.open')} onPress={onOpenSettings} bg="card" color="ink" />}
    >
      <LoadError />

      <Card>
        <XStack gap={10} items="center">
          <Icon name="fire" size={30} color={streak > 0 ? 'accent' : 'muted'} />
          <YStack flex={1}>
            <Text fontSize={20} fontWeight="700" color="ink">
              {streak > 0 ? t('today.streak', { count: streak }) : t('today.streakNone')}
            </Text>
            <Text fontSize={15} color="muted">
              {t('today.streakHint')}
            </Text>
          </YStack>
        </XStack>

        <XStack justify="space-between">
          {lastDays(today, 7).map((day) => {
            const count = activity.get(day) ?? 0;
            const isToday = day === today;
            return (
              <YStack
                key={day}
                role="img"
                aria-label={t('progress.heatmap.cell', { date: formatDay(day, language), count })}
                items="center"
                gap={6}
              >
                <Text fontSize={13} fontWeight={isToday ? '700' : '500'} color={isToday ? 'ink' : 'muted'} aria-hidden>
                  {formatWeekdayShort(day, language)}
                </Text>
                <YStack
                  w={32}
                  h={32}
                  rounded={16}
                  items="center"
                  justify="center"
                  bg={count > 0 ? 'brand' : 'cardAlt'}
                  borderWidth={isToday ? 2 : 0}
                  borderColor="ink"
                >
                  {count > 0 ? <Icon name="check-bold" size={18} color="onBrand" /> : null}
                </YStack>
              </YStack>
            );
          })}
        </XStack>
      </Card>

      <Group>
        <ValueRow testID="tile-wins" icon="trophy-outline" color="catWins" label={t('today.tiles.wins')} value={formatNumber(winsToday, language)} />
        <ValueRow
          testID="tile-mood"
          icon={roundedMood === null ? 'emoticon-outline' : MOOD_ICON[roundedMood]}
          color="catMood"
          label={t('today.tiles.mood')}
          value={roundedMood === null ? none : t(`journal.moods.${roundedMood}`)}
        />
        <ValueRow
          testID="tile-habits"
          icon="check-bold"
          color="catHabits"
          label={t('today.tiles.habits')}
          value={data.habits.length === 0 ? none : `${habitsDone}/${data.habits.length}`}
        />
        <ValueRow
          testID="tile-steps"
          icon="shoe-print"
          color="catSteps"
          label={t('today.tiles.steps')}
          value={stepsToday === null ? none : formatNumber(stepsToday, language)}
        />
      </Group>

      <Section title={t('today.quickWin.title')}>
        <QuickWinCard />
      </Section>

      {data.habits.length > 0 ? (
        <Section title={t('today.habitsTitle')}>
          <HabitChecklist />
        </Section>
      ) : null}

      <Section title={t('today.prompt.title')}>
        <Card>
          <Text fontSize={20} fontWeight="600" color="ink">
            {t(`today.prompt.items.${promptNumberForDay(today)}`)}
          </Text>
          <XStack>
            <AppButton variant="soft" size="sm" icon="pencil-outline" onPress={onOpenJournal}>
              {t('today.prompt.action')}
            </AppButton>
          </XStack>
        </Card>
      </Section>
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
      <XStack gap={8} flexWrap="wrap" items="center">
        <YStack flex={1} minW={180}>
          <TextField
            aria-label={t('today.quickWin.label')}
            placeholder={t('today.quickWin.placeholder')}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onSubmitEditing={handleAdd}
          />
        </YStack>
        <AppButton size="sm" icon="plus" onPress={handleAdd}>
          {t('common.add')}
        </AppButton>
      </XStack>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </Card>
  );
}
