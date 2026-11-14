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
import { Card, Chip, Screen, SectionTitle, StatTile } from '@/ui/kit';
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

  return (
    <Screen title={t('progress.title')} subtitle={t('progress.subtitle')}>
      <LoadError />

      <XStack gap="3" flexWrap="wrap">
        <StreakCard testID="streak-current" emoji="🔥" label={t('progress.streak.current')} days={currentStreak(activeDays, today)} highlight />
        <StreakCard testID="streak-best" emoji="🏅" label={t('progress.streak.best')} days={bestStreak(activeDays)} />
      </XStack>

      <Card>
        <SectionTitle>{t('progress.heatmap.title')}</SectionTitle>
        <XStack gap="1" justify="center">
          {heatmapWeeks(activity, today, HEATMAP_WEEKS).map((week) => (
            <YStack key={week[0].day} gap="1" flex={1} maxW={28}>
              {week.map((cell) =>
                cell.isFuture ? (
                  <YStack key={cell.day} aspectRatio={1} />
                ) : (
                  <YStack
                    key={cell.day}
                    role="img"
                    aria-label={t('progress.heatmap.cell', { date: formatDay(cell.day, language), count: cell.count })}
                    aspectRatio={1}
                    rounded="sm"
                    bg={HEAT_COLOR[cell.level]}
                    borderWidth={cell.day === today ? 2 : 0}
                    borderColor="ink"
                  />
                ),
              )}
            </YStack>
          ))}
        </XStack>
        <XStack gap="1.5" items="center" justify="flex-end">
          <Text fontSize="xs" color="muted">
            {t('progress.heatmap.less')}
          </Text>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <YStack key={level} w={14} h={14} rounded="sm" bg={HEAT_COLOR[level]} />
          ))}
          <Text fontSize="xs" color="muted">
            {t('progress.heatmap.more')}
          </Text>
        </XStack>
      </Card>

      <YStack gap="3">
        <XStack justify="space-between" items="center" gap="3" flexWrap="wrap">
          <SectionTitle>{t('progress.summary.title')}</SectionTitle>
          <XStack role="radiogroup" aria-label={t('progress.period.label')} gap="2">
            {(Object.keys(PERIODS) as Period[]).map((option) => (
              <Chip key={option} selected={option === period} onPress={() => setPeriod(option)}>
                {t(`progress.period.${option}`)}
              </Chip>
            ))}
          </XStack>
        </XStack>

        <XStack gap="3" flexWrap="wrap">
          <StatTile testID="summary-wins" emoji="🏆" label={t('progress.summary.wins')} value={formatNumber(summary.wins, language)} />
          <StatTile testID="summary-journal" emoji="💭" label={t('progress.summary.journal')} value={formatNumber(summary.journalEntries, language)} />
          <StatTile
            testID="summary-mood"
            emoji="🙂"
            label={t('progress.summary.mood')}
            value={summary.averageMood === null ? none : formatDecimal(summary.averageMood, language, 1)}
          />
          <StatTile
            testID="summary-steps"
            emoji="👟"
            label={t('progress.summary.steps')}
            value={summary.averageSteps === null ? none : formatNumber(Math.round(summary.averageSteps), language)}
          />
          <StatTile
            testID="summary-sleep"
            emoji="😴"
            label={t('progress.summary.sleep')}
            value={summary.averageSleep === null ? none : `${formatDecimal(summary.averageSleep, language, 1)} ${t('health.units.sleepHours')}`}
          />
          <StatTile
            testID="summary-water"
            emoji="💧"
            label={t('progress.summary.water')}
            value={summary.averageWater === null ? none : formatDecimal(summary.averageWater, language, 1)}
          />
          <StatTile
            testID="summary-training"
            emoji="🏋️"
            label={t('progress.summary.training')}
            value={`${formatNumber(summary.trainingMinutes, language)} ${t('health.units.trainingMinutes')}`}
          />
          <StatTile
            testID="summary-habits"
            emoji="✅"
            label={t('progress.summary.habits')}
            value={summary.habitCompletion === null ? none : formatPercent(summary.habitCompletion, language)}
          />
          <StatTile testID="summary-active" emoji="📅" label={t('progress.summary.activeDays')} value={`${summary.activeDays}/${days.length}`} />
        </XStack>
      </YStack>

      <MoodTrend days={days} />

      <Card bg="brandSoft" borderColor="brandSoft">
        <XStack gap="3" items="flex-start">
          <Text fontSize="2xl" aria-hidden>
            💡
          </Text>
          <YStack flex={1} gap="1">
            <Text fontSize="sm" fontWeight="700" color="brandInk">
              {t('progress.insight.title')}
            </Text>
            <Text fontSize="base" color="brandInk">
              {insight === null
                ? t('progress.insight.notEnough')
                : t(`progress.insight.${insight.percentDifference > 0 ? 'better' : insight.percentDifference < 0 ? 'worse' : 'same'}`, {
                    steps: formatNumber(insight.threshold, language),
                    percent: Math.abs(insight.percentDifference),
                  })}
            </Text>
          </YStack>
        </XStack>
      </Card>
    </Screen>
  );
}

type StreakCardProps = { testID: string; emoji: string; label: string; days: number; highlight?: boolean };

function StreakCard({ testID, emoji, label, days, highlight = false }: StreakCardProps) {
  const { t } = useTranslation();

  return (
    <Card testID={testID} grow={1} shrink={1} flexBasis={160} p="4" gap="1" bg={highlight ? 'accentSoft' : 'card'} borderColor={highlight ? 'accentSoft' : 'line'}>
      <Text fontSize="3xl" aria-hidden>
        {emoji}
      </Text>
      <Text fontSize="2xl" fontWeight="800" color={highlight ? 'accentInk' : 'ink'}>
        {t('progress.streak.days', { count: days })}
      </Text>
      <Text fontSize="sm" color={highlight ? 'accentInk' : 'muted'}>
        {label}
      </Text>
    </Card>
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
      <SectionTitle>{t('progress.moodTrend.title')}</SectionTitle>
      {hasMood ? (
        <XStack h={120} gap="1" items="flex-end">
          {days.map((day) => {
            const mood = moods.get(day);
            if (mood === undefined) {
              return <YStack key={day} flex={1} h={4} rounded="full" bg="cardAlt" />;
            }
            return (
              <YStack
                key={day}
                role="img"
                aria-label={t('progress.moodTrend.bar', { date: formatDay(day, language), mood: formatDecimal(mood, language, 1) })}
                flex={1}
                h={`${(mood / 5) * 100}%`}
                rounded="md"
                bg={MOOD_COLOR[Math.round(mood) as Mood]}
                borderWidth={1}
                borderColor="line"
              />
            );
          })}
        </XStack>
      ) : (
        <Text color="muted">{t('progress.moodTrend.empty')}</Text>
      )}
    </Card>
  );
}
