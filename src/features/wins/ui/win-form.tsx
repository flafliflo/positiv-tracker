import { useTranslation } from 'react-i18next';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { MAX_WIN_TEXT_LENGTH, WIN_CATEGORIES, type WinCategory } from '../domain/win';

export type WinFormError = 'textRequired' | 'textTooLong' | 'saveFailed' | 'loadFailed';

type Props = {
  text: string;
  category: WinCategory;
  error: WinFormError | null;
  onTextChange: (text: string) => void;
  onCategoryChange: (category: WinCategory) => void;
  onSubmit: () => void;
};

/** Reine Darstellung: Der Zustand lebt im WinsScreen, das Formular meldet nur Eingaben. */
export function WinForm({ text, category, error, onTextChange, onCategoryChange, onSubmit }: Props) {
  const { t } = useTranslation();

  return (
    <YStack gap="4" p="4" rounded="xl" bg="background" borderWidth={1} borderColor="border-color">
      <YStack gap="2">
        <Text fontSize="sm" fontWeight="600" color="color-9">
          {t('wins.form.textLabel')}
        </Text>
        <Input
          aria-label={t('wins.form.textLabel')}
          placeholder={t('wins.form.placeholder')}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onSubmitEditing={onSubmit}
          size="lg"
        />
      </YStack>

      <YStack gap="2">
        <Text fontSize="sm" fontWeight="600" color="color-9">
          {t('wins.form.categoryLabel')}
        </Text>
        <XStack role="radiogroup" aria-label={t('wins.form.categoryLabel')} gap="2" flexWrap="wrap">
          {WIN_CATEGORIES.map((option) => {
            const selected = option === category;
            return (
              <Button
                key={option}
                role="radio"
                aria-checked={selected}
                size="sm"
                rounded="full"
                theme={selected ? 'accent' : undefined}
                onPress={() => onCategoryChange(option)}
              >
                {t(`wins.categories.${option}`)}
              </Button>
            );
          })}
        </XStack>
      </YStack>

      {error ? (
        <Text role="alert" aria-live="polite" color="red-600" fontSize="sm">
          {t(`wins.errors.${error}`, { max: MAX_WIN_TEXT_LENGTH })}
        </Text>
      ) : null}

      <Button theme="accent" size="lg" onPress={onSubmit}>
        {t('wins.form.submit')}
      </Button>
    </YStack>
  );
}
