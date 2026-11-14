import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import type { ActionResult } from '@/app-data/app-data-provider';
import { AppButton, Chip, ErrorMessage, FieldLabel, TextField, type IconName } from '@/ui/kit';

import { MAX_WIN_TEXT_LENGTH, WIN_CATEGORIES, type WinCategory, type WinInput, type WinValidationError } from '../domain/win';

export const CATEGORY_ICON: Record<WinCategory, IconName> = {
  health: 'arm-flex-outline',
  work: 'briefcase-outline',
  learning: 'school-outline',
  relationships: 'account-heart-outline',
  mindset: 'head-lightbulb-outline',
  other: 'star-four-points-outline',
};

type Props = {
  initial?: WinInput;
  submitLabel: string;
  onSubmit: (input: WinInput) => Promise<ActionResult<WinValidationError>>;
  /** Wird nach erfolgreichem Speichern aufgerufen (z. B. um den Bearbeiten-Modus zu schliessen). */
  onDone?: () => void;
  onCancel?: () => void;
};

const EMPTY: WinInput = { text: '', category: 'other' };

/** Formular für einen Win – dient sowohl zum Erfassen als auch zum Bearbeiten. */
export function WinForm({ initial = EMPTY, submitLabel, onSubmit, onDone, onCancel }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(initial.text);
  const [category, setCategory] = useState<WinCategory>(initial.category);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = await onSubmit({ text, category });
    if (!result.ok) {
      const isValidation = result.error === 'textRequired' || result.error === 'textTooLong';
      setError(t(isValidation ? `wins.errors.${result.error}` : `common.${result.error}`, { max: MAX_WIN_TEXT_LENGTH }));
      return;
    }
    setError(null);
    setText(EMPTY.text);
    onDone?.();
  }

  return (
    <YStack gap={14}>
      <YStack gap={6}>
        <FieldLabel>{t('wins.form.textLabel')}</FieldLabel>
        <TextField
          aria-label={t('wins.form.textLabel')}
          placeholder={t('wins.form.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onSubmitEditing={handleSubmit}
        />
      </YStack>

      <YStack gap={6}>
        <FieldLabel>{t('wins.form.categoryLabel')}</FieldLabel>
        <XStack role="radiogroup" aria-label={t('wins.form.categoryLabel')} gap={8} flexWrap="wrap">
          {WIN_CATEGORIES.map((option) => (
            <Chip key={option} icon={CATEGORY_ICON[option]} selected={option === category} onPress={() => setCategory(option)}>
              {t(`wins.categories.${option}`)}
            </Chip>
          ))}
        </XStack>
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
