import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import type { ActionResult } from '@/app-data/app-data-provider';
import { AppButton, ErrorMessage, FieldLabel, TextAreaField } from '@/ui/kit';
import type { PaletteColor } from '@/ui/palette';

import {
  MAX_JOURNAL_TEXT_LENGTH,
  MOODS,
  type JournalInput,
  type JournalValidationError,
  type Mood,
} from '../domain/journal-entry';

export const MOOD_EMOJI: Record<Mood, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
export const MOOD_COLOR: Record<Mood, PaletteColor> = { 1: 'mood1', 2: 'mood2', 3: 'mood3', 4: 'mood4', 5: 'mood5' };

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
    <YStack gap="4">
      <YStack gap="2">
        <FieldLabel>{t('journal.form.moodLabel')}</FieldLabel>
        <XStack role="radiogroup" aria-label={t('journal.form.moodLabel')} gap="2" justify="space-between">
          {MOODS.map((option) => (
            <MoodButton key={option} mood={option} selected={option === mood} onPress={() => setMood(option)} />
          ))}
        </XStack>
      </YStack>

      <YStack gap="2">
        <FieldLabel>{t('journal.form.textLabel')}</FieldLabel>
        <TextAreaField
          aria-label={t('journal.form.textLabel')}
          placeholder={t('journal.form.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </YStack>

      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      <XStack gap="2" flexWrap="wrap">
        <YStack flex={1} minW={180}>
          <AppButton onPress={handleSubmit} icon="checkmark-circle">
            {submitLabel}
          </AppButton>
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
      flex={1}
      maxW={64}
      h={56}
      items="center"
      justify="center"
      rounded="2xl"
      bg={selected ? MOOD_COLOR[mood] : 'cardAlt'}
      borderWidth={2}
      borderColor={selected ? 'ink' : 'transparent'}
      cursor="web:pointer"
      transition="quick"
      scale={selected ? '1.08 press:0.95' : 'press:0.95'}
      outlineColor="focus-visible:brand"
      outlineStyle="focus-visible:solid"
      outlineWidth="focus-visible:3px"
    >
      <Text fontSize="2xl" aria-hidden>
        {MOOD_EMOJI[mood]}
      </Text>
    </YStack>
  );
}
