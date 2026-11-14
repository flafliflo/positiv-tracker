import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import type { Mood } from '@/features/journal/domain/journal-entry';
import { MOOD_COLOR } from '@/features/journal/ui/journal-form';
import { formatDay, formatDecimal, formatNumber, formatPercent } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';
import { lastDays } from '@/shared/day';
import { LoadError } from '@/ui/entry-actions';
import { Card, Group, Screen, Section, Segment, Segmented, ValueRow } from '@/ui/kit';
import type { PaletteColor } from '@/ui/palette';

import {
  activityByDay,
  bestStreak,
  currentStreak,
  heatmapWeeks,
  moodByDay,
  moodStepsInsight,
  summarizePeriod,
  type ActivityLevel,
} from '../domain/stats';

const HEATMAP_WEEKS = 12;
const STEPS_THRESHOLD = 8000;
const PERIODS = { week: 7, month: 30 } as const;
type Period = keyof typeof PERIODS;

const HEAT_COLOR: Record<ActivityLevel, PaletteColor> = { 0: 'heat0', 1: 'heat1', 2: 'heat2', 3: 'heat3', 4: 'heat4' };

export function ProgressScreen() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { data, today } = useAppData();
  const [period, setPeriod] = useState<Period>('week');

  const activity = activityByDay(data);
  const activeDays = new Set(activity.keys());
  const days = lastDays(today, PERIODS[period]);
  const summary = summarizePeriod(data, days);
  const insight = moodStepsInsight(data, { threshold: STEPS_THRESHOLD, minDays: 3 });
  const none = t('common.noValue');
  const sleepUnit = t('health.units.sleepHours');
  const trainingUnit = t('health.units.trainingMinutes');

  return (
    <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <LoadError />

      <Group>
        <ValueRow
          testID="streak-current"
          icon="fire"
          color="catWins"
          label={t('progress.streak.current')}
          value={t('progress.streak.days', { count: currentStreak(activeDays, today) })}
        />
        <ValueRow
          testID="streak-best"
          icon="medal-outline"
          color="catHabits"
          label={t('progress.streak.best')}
          value={t('progress.streak.days', { count: bestStreak(activeDays) })}
        />
      </Group>

      <Section title={t('progress.heatmap.title')}>
        <Card>
          <XStack gap={4} justify="center">
            {heatmapWeeks(activity, today, HEATMAP_WEEKS).map((week) => (
              <YStack key={week[0].day} gap={4} flex={1} maxW={26}>
                {week.map((cell) =>
                  cell.isFuture ? (
                    <YStack key={cell.day} aspectRatio={1} />
                  ) : (
                    <YStack
                      key={cell.day}
                      role="img"
                      aria-label={t('progress.heatmap.cell', { date: formatDay(cell.day, language), count: cell.count })}
                      aspectRatio={1}
                      rounded={4}
                      bg={HEAT_COLOR[cell.level]}
                      borderWidth={cell.day === today ? 2 : 0}
                      borderColor="ink"
                    />
                  ),
                )}
              </YStack>
            ))}
          </XStack>
          <XStack gap={6} items="center" justify="flex-end">
            <Text fontSize={13} color="muted">
              {t('progress.heatmap.less')}
            </Text>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <YStack key={level} w={12} h={12} rounded={3} bg={HEAT_COLOR[level]} />
            ))}
            <Text fontSize={13} color="muted">
              {t('progress.heatmap.more')}
            </Text>
          </XStack>
        </Card>
      </Section>

      <Section
        title={t('progress.summary.title')}
        action={
          <YStack minW={170}>
            <Segmented label={t('progress.period.label')}>
              {(Object.keys(PERIODS) as Period[]).map((option) => (
                <Segment key={option} selected={option === period} onPress={() => setPeriod(option)}>
                  {t(`progress.period.${option}`)}
                </Segment>
              ))}
            </Segmented>
          </YStack>
        }
      >
        <Group>
          <ValueRow testID="summary-wins" icon="trophy-outline" color="catWins" label={t('progress.summary.wins')} value={formatNumber(summary.wins, language)} />
          <ValueRow
            testID="summary-journal"
            icon="thought-bubble-outline"
            color="catMood"
            label={t('progress.summary.journal')}
            value={formatNumber(summary.journalEntries, language)}
          />
          <ValueRow
            testID="summary-mood"
            icon="emoticon-happy-outline"
            color="catMood"
            label={t('progress.summary.mood')}
            value={summary.averageMood === null ? none : formatDecimal(summary.averageMood, language, 1)}
          />
          <ValueRow
            testID="summary-steps"
            icon="shoe-print"
            color="catSteps"
            label={t('progress.summary.steps')}
            value={summary.averageSteps === null ? none : formatNumber(Math.round(summary.averageSteps), language)}
          />
          <ValueRow
            testID="summary-sleep"
            icon="sleep"
            color="catSleep"
            label={t('progress.summary.sleep')}
            value={summary.averageSleep === null ? none : `${formatDecimal(summary.averageSleep, language, 1)} ${sleepUnit}`}
          />
          <ValueRow
            testID="summary-water"
            icon="cup-water"
            color="catWater"
            label={t('progress.summary.water')}
            value={summary.averageWater === null ? none : formatDecimal(summary.averageWater, language, 1)}
          />
          <ValueRow
            testID="summary-training"
            icon="dumbbell"
            color="catTraining"
            label={t('progress.summary.training')}
            value={`${formatNumber(summary.trainingMinutes, language)} ${trainingUnit}`}
          />
          <ValueRow
            testID="summary-habits"
            icon="check-bold"
            color="catHabits"
            label={t('progress.summary.habits')}
            value={summary.habitCompletion === null ? none : formatPercent(summary.habitCompletion, language)}
          />
          <ValueRow
            testID="summary-active"
            icon="calendar-check-outline"
            color="catNeutral"
            label={t('progress.summary.activeDays')}
            value={`${summary.activeDays}/${days.length}`}
          />
        </Group>
      </Section>

      <Section title={t('progress.moodTrend.title')}>
        <MoodTrend days={days} />
      </Section>

      <Section title={t('progress.insight.title')}>
        <Card>
          <Text fontSize={17} color="ink">
            {insight === null
              ? t('progress.insight.notEnough')
              : t(`progress.insight.${insight.percentDifference > 0 ? 'better' : insight.percentDifference < 0 ? 'worse' : 'same'}`, {
                  steps: formatNumber(insight.threshold, language),
                  percent: Math.abs(insight.percentDifference),
                })}
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}

/** Balkendiagramm der Tagesstimmung: ein Balken pro Tag, Höhe = Stimmung 1–5. */
function MoodTrend({ days }: { days: readonly string[] }) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { data } = useAppData();
  const moods = moodByDay(data.journal);
  const hasMood = days.some((day) => moods.has(day));

  return (
    <Card>
      {hasMood ? (
        <XStack h={120} gap={days.length > 10 ? 2 : 6} items="flex-end">
          {days.map((day) => {
            const mood = moods.get(day);
            if (mood === undefined) {
              return <YStack key={day} flex={1} h={3} rounded={2} bg="cardAlt" />;
            }
            return (
              <YStack
                key={day}
                role="img"
                aria-label={t('progress.moodTrend.bar', { date: formatDay(day, language), mood: formatDecimal(mood, language, 1) })}
                flex={1}
                h={`${(mood / 5) * 100}%`}
                rounded={4}
                bg={MOOD_COLOR[Math.round(mood) as Mood]}
              />
            );
          })}
        </XStack>
      ) : (
        <Text fontSize={15} color="muted">
          {t('progress.moodTrend.empty')}
        </Text>
      )}
    </Card>
  );
}
