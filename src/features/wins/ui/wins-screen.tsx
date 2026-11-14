import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { useDayLabel } from '@/i18n/use-day-label';
import { EntryActions, LoadError } from '@/ui/entry-actions';
import { Card, EmptyState, Screen, SectionTitle } from '@/ui/kit';

import { sortNewestFirst, type Win } from '../domain/win';
import { CATEGORY_EMOJI, WinForm } from './win-form';

export function WinsScreen() {
  const { t } = useTranslation();
  const { status, data, actions } = useAppData();
  const wins = sortNewestFirst(data.wins);

  return (
    <Screen title={t('wins.title')} subtitle={t('wins.subtitle')}>
      <LoadError />

      <Card>
        <WinForm submitLabel={t('wins.form.submit')} onSubmit={actions.addWin} />
      </Card>

      {status === 'ready' && wins.length === 0 ? (
        <EmptyState emoji="🏆" title={t('wins.empty.title')} body={t('wins.empty.body')} />
      ) : null}

      {wins.length > 0 ? (
        <YStack gap="3">
          <SectionTitle>{t('wins.list.title')}</SectionTitle>
          <YStack role="list" gap="3">
            {wins.map((win) => (
              <WinItem key={win.id} win={win} />
            ))}
          </YStack>
        </YStack>
      ) : null}
    </Screen>
  );
}

function WinItem({ win }: { win: Win }) {
  const { t } = useTranslation();
  const { actions } = useAppData();
  const dayLabel = useDayLabel();
  const [editing, setEditing] = useState(false);

  return (
    <Card role="listitem" testID={`win-item-${win.id}`} p="4" gap="3">
      {editing ? (
        <WinForm
          initial={{ text: win.text, category: win.category }}
          submitLabel={t('wins.form.update')}
          onSubmit={(input) => actions.updateWin(win.id, input)}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <XStack gap="3" items="flex-start">
          <YStack w={44} h={44} rounded="full" bg="accentSoft" items="center" justify="center">
            <Text fontSize="xl" aria-hidden>
              {CATEGORY_EMOJI[win.category]}
            </Text>
          </YStack>
          <YStack flex={1} gap="1">
            <Text fontSize="base" fontWeight="600" color="ink">
              {win.text}
            </Text>
            <XStack gap="2" items="center" flexWrap="wrap">
              <Text fontSize="sm" fontWeight="600" color="accentInk">
                {t(`wins.categories.${win.category}`)}
              </Text>
              <Text fontSize="sm" color="muted" aria-hidden>
                ·
              </Text>
              <Text fontSize="sm" color="muted">
                {dayLabel(win.day)}
              </Text>
            </XStack>
          </YStack>
          <EntryActions onEdit={() => setEditing(true)} onDelete={() => void actions.removeWin(win.id)} />
        </XStack>
      )}
    </Card>
  );
}
