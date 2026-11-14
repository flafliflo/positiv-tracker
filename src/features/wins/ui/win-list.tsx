import { useTranslation } from 'react-i18next';
import { H2, Text, XStack, YStack } from 'tamagui';

import { formatDay } from '@/i18n/format';
import { useLanguage } from '@/i18n/use-language';

import type { Win } from '../domain/win';

export function WinList({ wins }: { wins: readonly Win[] }) {
  const { t } = useTranslation();
  const language = useLanguage();

  if (wins.length === 0) {
    return (
      <YStack items="center" gap="2" py="8" px="4">
        <Text fontSize="lg" fontWeight="600">
          {t('wins.empty.title')}
        </Text>
        <Text color="color-9" text="center">
          {t('wins.empty.body')}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="3">
      <H2 fontSize="lg" fontWeight="600">
        {t('wins.list.title')}
      </H2>
      <YStack role="list" gap="3">
        {wins.map((win) => (
          <YStack
            key={win.id}
            role="listitem"
            testID={`win-item-${win.id}`}
            gap="2"
            p="4"
            rounded="xl"
            bg="background"
            borderWidth={1}
            borderColor="border-color"
          >
            <Text fontSize="base">{win.text}</Text>
            <XStack gap="2" items="center" flexWrap="wrap">
              <Text fontSize="xs" fontWeight="600" color="color-9">
                {t(`wins.categories.${win.category}`)}
              </Text>
              <Text fontSize="xs" color="color-9" aria-hidden>
                ·
              </Text>
              <Text fontSize="xs" color="color-9">
                {formatDay(win.day, language)}
              </Text>
            </XStack>
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
}
