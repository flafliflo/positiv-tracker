import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { sortNewestFirst } from '@/features/wins/domain/win';
import { useDayLabel } from '@/i18n/use-day-label';
import { EntryActions, LoadError } from '@/ui/entry-actions';
import { Card, EmptyState, Group, Screen, Section } from '@/ui/kit';

import type { JournalEntry } from '../domain/journal-entry';
import { JournalForm, MoodFace } from './journal-form';

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
        <EmptyState icon="thought-bubble-outline" title={t('journal.empty.title')} body={t('journal.empty.body')} />
      ) : null}

      {entries.length > 0 ? (
        <Section title={t('journal.list.title')}>
          <Group role="list">
            {entries.map((entry) => (
              <JournalItem key={entry.id} entry={entry} />
            ))}
          </Group>
        </Section>
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
    <YStack role="listitem" testID={`journal-item-${entry.id}`} px={16} py={12}>
      {editing ? (
        <JournalForm
          initial={{ text: entry.text, mood: entry.mood }}
          submitLabel={t('journal.form.update')}
          onSubmit={(input) => actions.updateJournalEntry(entry.id, input)}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <XStack gap={12} items="flex-start">
          <MoodFace mood={entry.mood} size={34} />
          <YStack flex={1} gap={2}>
            <XStack gap={6} items="center" flexWrap="wrap" minH={34}>
              <Text fontSize={17} fontWeight="600" color="ink">
                {t(`journal.moods.${entry.mood}`)}
              </Text>
              <Text fontSize={13} color="muted" aria-hidden>
                ·
              </Text>
              <Text fontSize={13} color="muted">
                {dayLabel(entry.day)}
              </Text>
            </XStack>
            {entry.text ? (
              <Text fontSize={17} color="ink">
                {entry.text}
              </Text>
            ) : null}
          </YStack>
          <EntryActions onEdit={() => setEditing(true)} onDelete={() => void actions.removeJournalEntry(entry.id)} />
        </XStack>
      )}
    </YStack>
  );
}
