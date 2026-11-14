import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { MAX_HABIT_NAME_LENGTH } from '@/features/habits/domain/habit';
import { HabitChecklist } from '@/features/habits/ui/habit-checklist';
import { formatDecimal, formatNumber } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';
import { LoadError } from '@/ui/entry-actions';
import {
  AppButton,
  Card,
  EmptyState,
  ErrorMessage,
  Footnote,
  Group,
  IconButton,
  IconChip,
  Row,
  Screen,
  Section,
  TextField,
  type IconName,
} from '@/ui/kit';
import type { PaletteColor } from '@/ui/palette';

import { manualStepsSource, type StepsSource } from '../data/steps-source';
import { adjustHealthMetric, emptyHealthDay, parseMetricInput, type HealthDay, type HealthMetric } from '../domain/health-day';

type Props = {
  /** Woher die Schritte kommen. Im Web: manuelle Eingabe. Später: HealthKit / Health Connect. */
  stepsSource?: StepsSource;
};

type StepperMetric = Exclude<HealthMetric, 'steps'>;

const STEPPER_METRICS: readonly { metric: StepperMetric; icon: IconName; color: PaletteColor; digits: number }[] = [
  { metric: 'sleepHours', icon: 'sleep', color: 'catSleep', digits: 1 },
  { metric: 'waterGlasses', icon: 'cup-water', color: 'catWater', digits: 0 },
  { metric: 'trainingMinutes', icon: 'dumbbell', color: 'catTraining', digits: 0 },
];

export function HealthScreen({ stepsSource = manualStepsSource }: Props) {
  const { t } = useTranslation();
  const { status, data, today } = useAppData();
  const healthToday = data.health.find((healthDay) => healthDay.day === today) ?? emptyHealthDay(today);

  return (
    <Screen title={t('health.title')} subtitle={t('health.subtitle')}>
      <LoadError />

      <YStack gap={8}>
        <Group>
          <StepsRow healthToday={healthToday} manualEntry={stepsSource.requiresManualEntry} />
          {STEPPER_METRICS.map((config, index) => (
            <StepperRow key={config.metric} testID={`metric-${index + 1}`} healthToday={healthToday} {...config} />
          ))}
        </Group>
        {stepsSource.requiresManualEntry ? <Footnote>{t('health.stepsHint')}</Footnote> : null}
      </YStack>

      <Section title={t('habits.title')}>
        <Card>
          <AddHabitForm />
        </Card>
        {status === 'ready' && data.habits.length === 0 ? (
          <EmptyState icon="sprout-outline" title={t('habits.empty.title')} body={t('habits.empty.body')} />
        ) : (
          <HabitChecklist manage />
        )}
      </Section>
    </Screen>
  );
}

function StepsRow({ healthToday, manualEntry }: { healthToday: HealthDay; manualEntry: boolean }) {
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
    <YStack testID="metric-0" px={16} py={12} gap={12}>
      <XStack gap={12} items="center">
        <IconChip icon="shoe-print" color="catSteps" />
        <Text flex={1} fontSize={17} color="ink">
          {t('health.metrics.steps')}
        </Text>
        <Text fontSize={17} fontWeight="600" color="ink">
          {healthToday.steps === null ? t('common.noValue') : formatNumber(healthToday.steps, language)}
        </Text>
      </XStack>

      {manualEntry ? (
        <>
          <XStack gap={8} flexWrap="wrap" items="center">
            <YStack flex={1} minW={150}>
              <TextField
                aria-label={t('health.metrics.steps')}
                placeholder={t('health.stepsPlaceholder')}
                inputMode="numeric"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onSubmitEditing={handleSave}
              />
            </YStack>
            <AppButton variant="soft" size="sm" onPress={handleSave}>
              {t('health.stepsSave')}
            </AppButton>
          </XStack>
          {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        </>
      ) : null}
    </YStack>
  );
}

type StepperRowProps = {
  testID: string;
  healthToday: HealthDay;
  metric: StepperMetric;
  icon: IconName;
  color: PaletteColor;
  digits: number;
};

function StepperRow({ testID, healthToday, metric, icon, color, digits }: StepperRowProps) {
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
    <Row testID={testID}>
      <IconChip icon={icon} color={color} />
      <Text flex={1} fontSize={17} color="ink">
        {name}
      </Text>
      <XStack gap={4} items="baseline">
        <Text fontSize={17} fontWeight="600" color="ink">
          {value === null ? t('common.noValue') : formatDecimal(value, language, digits)}
        </Text>
        <Text fontSize={13} color="muted">
          {t(`health.units.${metric}`)}
        </Text>
      </XStack>
      <XStack bg="cardAlt" rounded={10} items="center">
        <IconButton icon="minus" label={t('health.decrease', { metric: name })} onPress={() => adjust(-1)} color="ink" />
        <YStack w={1} h={20} bg="line" />
        <IconButton icon="plus" label={t('health.increase', { metric: name })} onPress={() => adjust(1)} color="ink" />
      </XStack>
    </Row>
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
    <YStack gap={10}>
      <XStack gap={8} flexWrap="wrap" items="center">
        <YStack flex={1} minW={150}>
          <TextField
            aria-label={t('habits.addLabel')}
            placeholder={t('habits.placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onSubmitEditing={handleAdd}
          />
        </YStack>
        <AppButton variant="soft" size="sm" icon="plus" onPress={handleAdd}>
          {t('common.add')}
        </AppButton>
      </XStack>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </YStack>
  );
}
