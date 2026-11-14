import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { H1, ScrollView, Text, XStack, YStack } from 'tamagui';

import { LanguageSwitcher } from '@/features/settings/ui/language-switcher';

import { useWinRepository } from '../data/win-repository-context';
import { createWin, type Win, type WinCategory } from '../domain/win';
import { generateWinId } from '../domain/generate-win-id';
import { WinForm, type WinFormError } from './win-form';
import { WinList } from './win-list';

type Props = {
  /** Uhr und ID-Erzeugung sind austauschbar, damit Tests feste Werte nutzen können. */
  now?: () => Date;
  generateId?: () => string;
};

const currentDate = () => new Date();

export function WinsScreen({ now = currentDate, generateId = generateWinId }: Props) {
  const { t } = useTranslation();
  const repository = useWinRepository();

  const [wins, setWins] = useState<Win[] | null>(null); // null = wird noch geladen
  const [text, setText] = useState('');
  const [category, setCategory] = useState<WinCategory>('other');
  const [error, setError] = useState<WinFormError | null>(null);

  useEffect(() => {
    let active = true;
    repository
      .list()
      .then((loaded) => {
        if (active) setWins(loaded);
      })
      .catch(() => {
        if (!active) return;
        setWins([]);
        setError('loadFailed');
      });
    return () => {
      active = false;
    };
  }, [repository]);

  async function handleSubmit() {
    const result = createWin({ text, category }, { now, generateId });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    try {
      await repository.add(result.win);
      setWins(await repository.list());
      setText('');
      setError(null);
    } catch {
      setError('saveFailed');
    }
  }

  return (
    <ScrollView flex={1} bg="color-2" keyboardShouldPersistTaps="handled">
      <YStack w="100%" maxW={640} self="center" gap="6" px="4" py="8">
        <XStack justify="space-between" items="flex-start" gap="4">
          <YStack flex={1} gap="1">
            <H1 fontSize="3xl" fontWeight="700">
              {t('wins.title')}
            </H1>
            <Text fontSize="lg" color="color-9">
              {t('wins.subtitle')}
            </Text>
          </YStack>
          <LanguageSwitcher />
        </XStack>

        <WinForm
          text={text}
          category={category}
          error={error}
          onTextChange={setText}
          onCategoryChange={setCategory}
          onSubmit={handleSubmit}
        />

        {wins ? <WinList wins={wins} /> : null}

        <Text fontSize="xs" color="color-9" text="center">
          {t('privacy.localOnly')}
        </Text>
      </YStack>
    </ScrollView>
  );
}
