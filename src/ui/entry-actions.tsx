import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';

import { AppButton, ErrorMessage, IconButton } from './kit';

type Props = {
  onEdit?: () => void;
  onDelete: () => void;
  /** Eigene Beschriftung des Löschen-Knopfs, z. B. „Lesen löschen". */
  deleteLabel?: string;
};

/**
 * Bearbeiten/Löschen für einen Eintrag. Löschen fragt zuerst nach –
 * ein versehentlicher Tipp soll keine Daten kosten.
 */
export function EntryActions({ onEdit, onDelete, deleteLabel }: Props) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <XStack gap={8} items="center" flexWrap="wrap" justify="flex-end">
        <Text fontSize={15} fontWeight="600" color="ink">
          {t('common.confirmDelete')}
        </Text>
        <AppButton size="sm" variant="danger" onPress={onDelete}>
          {t('common.delete')}
        </AppButton>
        <AppButton size="sm" variant="ghost" onPress={() => setConfirming(false)}>
          {t('common.cancel')}
        </AppButton>
      </XStack>
    );
  }

  return (
    <XStack>
      {onEdit ? <IconButton icon="pencil-outline" label={t('common.edit')} onPress={onEdit} /> : null}
      <IconButton icon="trash-can-outline" label={deleteLabel ?? t('common.delete')} onPress={() => setConfirming(true)} />
    </XStack>
  );
}

/** Zeigt eine Fehlermeldung, wenn die Daten nicht geladen werden konnten. */
export function LoadError() {
  const { t } = useTranslation();
  const { status } = useAppData();

  return status === 'error' ? <ErrorMessage>{t('common.loadFailed')}</ErrorMessage> : null;
}
