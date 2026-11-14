import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { useDayLabel } from '@/i18n/use-day-label';
import { EntryActions, LoadError } from '@/ui/entry-actions';
import { Card, EmptyState, Group, IconChip, Screen, Section } from '@/ui/kit';

import { sortNewestFirst, type Win } from '../domain/win';
import { CATEGORY_ICON, WinForm } from './win-form';

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
        <EmptyState icon="trophy-outline" title={t('wins.empty.title')} body={t('wins.empty.body')} />
      ) : null}

      {wins.length > 0 ? (
        <Section title={t('wins.list.title')}>
          <Group role="list">
            {wins.map((win) => (
              <WinItem key={win.id} win={win} />
            ))}
          </Group>
        </Section>
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
    <YStack role="listitem" testID={`win-item-${win.id}`} px={16} py={12}>
      {editing ? (
        <WinForm
          initial={{ text: win.text, category: win.category }}
          submitLabel={t('wins.form.update')}
          onSubmit={(input) => actions.updateWin(win.id, input)}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <XStack gap={12} items="center">
          <IconChip icon={CATEGORY_ICON[win.category]} color="catWins" size={34} />
          <YStack flex={1} gap={2}>
            <Text fontSize={17} color="ink">
              {win.text}
            </Text>
            <XStack gap={6} items="center" flexWrap="wrap">
              <Text fontSize={13} fontWeight="600" color="accentInk">
                {t(`wins.categories.${win.category}`)}
              </Text>
              <Text fontSize={13} color="muted" aria-hidden>
                ·
              </Text>
              <Text fontSize={13} color="muted">
                {dayLabel(win.day)}
              </Text>
            </XStack>
          </YStack>
          <EntryActions onEdit={() => setEditing(true)} onDelete={() => void actions.removeWin(win.id)} />
        </XStack>
      )}
    </YStack>
  );
}
