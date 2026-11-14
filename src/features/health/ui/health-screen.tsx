import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { MAX_HABIT_NAME_LENGTH } from '@/features/habits/domain/habit';
import { HabitChecklist } from '@/features/habits/ui/habit-checklist';
import { formatDecimal, formatNumber } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';
import { LoadError } from '@/ui/entry-actions';
import { AppButton, Card, EmptyState, ErrorMessage, FieldLabel, IconButton, Screen, SectionTitle, TextField } from '@/ui/kit';

import { manualStepsSource, type StepsSource } from '../data/steps-source';
import { adjustHealthMetric, emptyHealthDay, parseMetricInput, type HealthDay, type HealthMetric } from '../domain/health-day';

type Props = {
  /** Woher die Schritte kommen. Im Web: manuelle Eingabe. Später: HealthKit / Health Connect. */
  stepsSource?: StepsSource;
};

const STEPPER_METRICS = [
  { metric: 'sleepHours', emoji: '😴', digits: 1 },
  { metric: 'waterGlasses', emoji: '💧', digits: 0 },
  { metric: 'trainingMinutes', emoji: '🏋️', digits: 0 },
] as const;

export function HealthScreen({ stepsSource = manualStepsSource }: Props) {
  const { t } = useTranslation();
  const { status, data, today } = useAppData();
  const healthToday = data.health.find((healthDay) => healthDay.day === today) ?? emptyHealthDay(today);

  return (
    <Screen title={t('health.title')} subtitle={t('health.subtitle')}>
      <LoadError />

      <StepsCard healthToday={healthToday} manualEntry={stepsSource.requiresManualEntry} />

      <XStack gap="3" flexWrap="wrap">
        {STEPPER_METRICS.map(({ metric, emoji, digits }, index) => (
          <StepperCard key={metric} testID={`metric-${index + 1}`} healthToday={healthToday} metric={metric} emoji={emoji} digits={digits} />
        ))}
      </XStack>

      <YStack gap="3">
        <SectionTitle>{t('habits.title')}</SectionTitle>
        <Card>
          <AddHabitForm />
          {status === 'ready' && data.habits.length === 0 ? (
            <EmptyState emoji="🌱" title={t('habits.empty.title')} body={t('habits.empty.body')} />
          ) : (
            <HabitChecklist manage />
          )}
        </Card>
      </YStack>
    </Screen>
  );
}

function StepsCard({ healthToday, manualEntry }: { healthToday: HealthDay; manualEntry: boolean }) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { today, actions } = useAppData();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const steps = parseMetricInput(input);
    if (steps === null) {
      setError(t('health.stepsInvalid'));
      return;
    }
    const result = await actions.setHealthMetric(today, 'steps', steps);
    if (!result.ok) {
      setError(t(`common.${result.error}`));
      return;
    }
    setError(null);
    setInput('');
  }

  return (
    <Card testID="metric-0">
      <XStack gap="3" items="center">
        <Text fontSize="3xl" aria-hidden>
          👟
        </Text>
        <YStack flex={1}>
          <FieldLabel>{t('health.metrics.steps')}</FieldLabel>
          <Text fontSize="3xl" fontWeight="800" color="ink">
            {healthToday.steps === null ? t('common.noValue') : formatNumber(healthToday.steps, language)}
          </Text>
        </YStack>
      </XStack>

      {manualEntry ? (
        <>
          <XStack gap="2" flexWrap="wrap" items="center">
            <YStack flex={1} minW={160}>
              <TextField
                aria-label={t('health.metrics.steps')}
                placeholder={t('health.stepsPlaceholder')}
                inputMode="numeric"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onSubmitEditing={handleSave}
              />
            </YStack>
            <AppButton variant="soft" onPress={handleSave}>
              {t('health.stepsSave')}
            </AppButton>
          </XStack>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
          <Text fontSize="sm" color="muted">
            {t('health.stepsHint')}
          </Text>
        </>
      ) : null}
    </Card>
  );
}

type StepperCardProps = {
  testID: string;
  healthToday: HealthDay;
  metric: Exclude<HealthMetric, 'steps'>;
  emoji: string;
  digits: number;
};

function StepperCard({ testID, healthToday, metric, emoji, digits }: StepperCardProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const { today, actions } = useAppData();
  const value = healthToday[metric];
  const name = t(`health.metrics.${metric}`);

  function adjust(direction: 1 | -1) {
    const next = adjustHealthMetric(healthToday, metric, direction)[metric];
    if (next !== value) void actions.setHealthMetric(today, metric, next);
  }

  return (
    <Card testID={testID} grow={1} shrink={1} flexBasis={180} p="4" gap="3">
      <XStack gap="2" items="center">
        <Text fontSize="xl" aria-hidden>
          {emoji}
        </Text>
        <FieldLabel>{name}</FieldLabel>
      </XStack>
      <XStack items="center" justify="space-between" gap="2">
        <IconButton icon="remove" label={t('health.decrease', { metric: name })} onPress={() => adjust(-1)} bg="cardAlt" color="ink" />
        <YStack items="center">
          <Text fontSize="2xl" fontWeight="800" color="ink">
            {value === null ? t('common.noValue') : formatDecimal(value, language, digits)}
          </Text>
          <Text fontSize="xs" color="muted">
            {t(`health.units.${metric}`)}
          </Text>
        </YStack>
        <IconButton icon="add" label={t('health.increase', { metric: name })} onPress={() => adjust(1)} bg="brandSoft" color="brandInk" />
      </XStack>
    </Card>
  );
}

function AddHabitForm() {
  const { t } = useTranslation();
  const { actions } = useAppData();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const result = await actions.addHabit(name);
    if (!result.ok) {
      const isValidation = result.error === 'nameRequired' || result.error === 'nameTooLong';
      setError(t(isValidation ? `habits.errors.${result.error}` : `common.${result.error}`, { max: MAX_HABIT_NAME_LENGTH }));
      return;
    }
    setError(null);
    setName('');
  }

  return (
    <YStack gap="2">
      <XStack gap="2" flexWrap="wrap" items="center">
        <YStack flex={1} minW={160}>
          <TextField
            aria-label={t('habits.addLabel')}
            placeholder={t('habits.placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onSubmitEditing={handleAdd}
          />
        </YStack>
        <AppButton variant="soft" icon="add" onPress={handleAdd}>
          {t('common.add')}
        </AppButton>
      </XStack>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </YStack>
  );
}
