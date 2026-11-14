import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { sortNewestFirst } from '@/features/wins/domain/win';
import { useDayLabel } from '@/i18n/use-day-label';
import { EntryActions, LoadError } from '@/ui/entry-actions';
import { Card, EmptyState, Screen, SectionTitle } from '@/ui/kit';

import type { JournalEntry } from '../domain/journal-entry';
import { JournalForm, MOOD_COLOR, MOOD_EMOJI } from './journal-form';

export function JournalScreen() {
  const { t } = useTranslation();
  const { status, data, actions } = useAppData();
  const entries = sortNewestFirst(data.journal);

  return (
    <Screen title={t('journal.title')} subtitle={t('journal.subtitle')}>
      <LoadError />

      <Card>
        <JournalForm submitLabel={t('journal.form.submit')} onSubmit={actions.addJournalEntry} />
      </Card>

      {status === 'ready' && entries.length === 0 ? (
        <EmptyState emoji="💭" title={t('journal.empty.title')} body={t('journal.empty.body')} />
      ) : null}

      {entries.length > 0 ? (
        <YStack gap="3">
          <SectionTitle>{t('journal.list.title')}</SectionTitle>
          <YStack role="list" gap="3">
            {entries.map((entry) => (
              <JournalItem key={entry.id} entry={entry} />
            ))}
          </YStack>
        </YStack>
      ) : null}
    </Screen>
  );
}

function JournalItem({ entry }: { entry: JournalEntry }) {
  const { t } = useTranslation();
  const { actions } = useAppData();
  const dayLabel = useDayLabel();
  const [editing, setEditing] = useState(false);

  return (
    <Card role="listitem" testID={`journal-item-${entry.id}`} p="4" gap="3">
      {editing ? (
        <JournalForm
          initial={{ text: entry.text, mood: entry.mood }}
          submitLabel={t('journal.form.update')}
          onSubmit={(input) => actions.updateJournalEntry(entry.id, input)}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <XStack gap="3" items="flex-start">
          <YStack w={44} h={44} rounded="full" bg={MOOD_COLOR[entry.mood]} items="center" justify="center">
            <Text fontSize="xl" aria-hidden>
              {MOOD_EMOJI[entry.mood]}
            </Text>
          </YStack>
          <YStack flex={1} gap="1">
            <XStack gap="2" items="center" flexWrap="wrap">
              <Text fontSize="base" fontWeight="700" color="ink">
                {t(`journal.moods.${entry.mood}`)}
              </Text>
              <Text fontSize="sm" color="muted" aria-hidden>
                ·
              </Text>
              <Text fontSize="sm" color="muted">
                {dayLabel(entry.day)}
              </Text>
            </XStack>
            {entry.text ? (
              <Text fontSize="base" color="ink">
                {entry.text}
              </Text>
            ) : null}
          </YStack>
          <EntryActions onEdit={() => setEditing(true)} onDelete={() => void actions.removeJournalEntry(entry.id)} />
        </XStack>
      )}
    </Card>
  );
}
