import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import type { ActionResult } from '@/app-data/app-data-provider';
import { AppButton, ErrorMessage, FieldLabel, Icon, TextAreaField, type IconName } from '@/ui/kit';
import type { PaletteColor } from '@/ui/palette';

import {
  MAX_JOURNAL_TEXT_LENGTH,
  MOODS,
  type JournalInput,
  type JournalValidationError,
  type Mood,
} from '../domain/journal-entry';

export const MOOD_ICON: Record<Mood, IconName> = {
  1: 'emoticon-cry-outline',
  2: 'emoticon-sad-outline',
  3: 'emoticon-neutral-outline',
  4: 'emoticon-happy-outline',
  5: 'emoticon-excited-outline',
};
export const MOOD_COLOR: Record<Mood, PaletteColor> = { 1: 'mood1', 2: 'mood2', 3: 'mood3', 4: 'mood4', 5: 'mood5' };

/** Stimmungs-Gesicht auf seiner Farbe – in Formular, Liste und Heute-Ansicht gleich. */
export function MoodFace({ mood, size = 36 }: { mood: Mood; size?: number }) {
  return (
    <YStack w={size} h={size} rounded={size / 2} bg={MOOD_COLOR[mood]} items="center" justify="center">
      <Icon name={MOOD_ICON[mood]} size={size * 0.72} color="onMood" />
    </YStack>
  );
}

type Props = {
  initial?: JournalInput;
  submitLabel: string;
  onSubmit: (input: JournalInput) => Promise<ActionResult<JournalValidationError>>;
  onDone?: () => void;
  onCancel?: () => void;
};

const EMPTY: JournalInput = { text: '', mood: null };

/** Formular für einen Journal-Eintrag: Stimmung wählen, optional Text schreiben. */
export function JournalForm({ initial = EMPTY, submitLabel, onSubmit, onDone, onCancel }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(initial.text);
  const [mood, setMood] = useState<Mood | null>(initial.mood);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = await onSubmit({ text, mood });
    if (!result.ok) {
      const isValidation = result.error === 'moodRequired' || result.error === 'textTooLong';
      setError(t(isValidation ? `journal.errors.${result.error}` : `common.${result.error}`, { max: MAX_JOURNAL_TEXT_LENGTH }));
      return;
    }
    setError(null);
    setText(EMPTY.text);
    setMood(EMPTY.mood);
    onDone?.();
  }

  return (
    <YStack gap={14}>
      <YStack gap={8}>
        <FieldLabel>{t('journal.form.moodLabel')}</FieldLabel>
        <XStack role="radiogroup" aria-label={t('journal.form.moodLabel')} gap={4} justify="space-between">
          {MOODS.map((option) => (
            <MoodButton key={option} mood={option} selected={option === mood} onPress={() => setMood(option)} />
          ))}
        </XStack>
      </YStack>

      <YStack gap={6}>
        <FieldLabel>{t('journal.form.textLabel')}</FieldLabel>
        <TextAreaField
          aria-label={t('journal.form.textLabel')}
          placeholder={t('journal.form.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </YStack>

      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      <XStack gap={8} flexWrap="wrap">
        <YStack flex={1} minW={180}>
          <AppButton onPress={handleSubmit}>{submitLabel}</AppButton>
        </YStack>
        {onCancel ? (
          <AppButton variant="ghost" onPress={onCancel}>
            {t('common.cancel')}
          </AppButton>
        ) : null}
      </XStack>
    </YStack>
  );
}

function MoodButton({ mood, selected, onPress }: { mood: Mood; selected: boolean; onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <YStack
      role="radio"
      render={<button type="button" />}
      tabIndex={0}
      aria-checked={selected}
      aria-label={t(`journal.moods.${mood}`)}
      onPress={onPress}
      grow={1}
      shrink={1}
      flexBasis={0}
      items="center"
      gap={6}
      py={8}
      rounded={12}
      bg={selected ? 'cardAlt' : 'transparent'}
      borderWidth={0}
      cursor="web:pointer"
      transition="quick"
      opacity="hover:0.85 press:0.6"
      outlineColor="focus-visible:brand"
      outlineStyle="focus-visible:solid"
      outlineWidth="focus-visible:3px"
    >
      <YStack
        w={44}
        h={44}
        rounded={22}
        items="center"
        justify="center"
        bg={selected ? MOOD_COLOR[mood] : 'cardAlt'}
        transition="quick"
        scale={selected ? 1.1 : 1}
      >
        <Icon name={MOOD_ICON[mood]} size={32} color={selected ? 'onMood' : 'muted'} />
      </YStack>
      <Text fontSize={11} fontWeight={selected ? '700' : '500'} color={selected ? 'ink' : 'muted'} text="center" aria-hidden>
        {t(`journal.moods.${mood}`)}
      </Text>
    </YStack>
  );
}
