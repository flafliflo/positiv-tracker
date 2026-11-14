import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { AppButton, Card, ErrorMessage, IconButton, Screen, SectionTitle } from '@/ui/kit';

import { buildExportFile, saveExportFile, type ExportFile } from '../data/export-file';
import { LanguageSwitcher } from './language-switcher';

type Props = {
  onBack: () => void;
  /** Speichert die Export-Datei; Tests übergeben eine Attrappe. */
  saveFile?: (file: ExportFile) => Promise<void>;
};

type Notice = 'exported' | 'deleted' | null;

/** Einstellungen: Sprache sowie Export und Löschung aller Daten (DSG/DSGVO). */
export function SettingsScreen({ onBack, saveFile = saveExportFile }: Props) {
  const { t } = useTranslation();
  const { actions } = useAppData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [failed, setFailed] = useState(false);

  async function handleExport() {
    setFailed(false);
    try {
      await saveFile(buildExportFile(await actions.exportData()));
      setNotice('exported');
    } catch {
      setNotice(null);
      setFailed(true);
    }
  }

  async function handleDelete() {
    const result = await actions.deleteAllData();
    setConfirmingDelete(false);
    setFailed(!result.ok);
    setNotice(result.ok ? 'deleted' : null);
  }

  return (
    <Screen
      title={t('settings.title')}
      action={<IconButton icon="arrow-back" label={t('settings.back')} onPress={onBack} bg="card" color="ink" />}
    >
      <Card>
        <SectionTitle>{t('settings.language')}</SectionTitle>
        <LanguageSwitcher />
      </Card>

      <Card>
        <SectionTitle>{t('settings.data.title')}</SectionTitle>
        <XStack gap="2" items="center">
          <Text fontSize="xl" aria-hidden>
            🔒
          </Text>
          <Text flex={1} color="muted">
            {t('privacy.localOnly')}
          </Text>
        </XStack>

        <AppButton variant="soft" icon="download-outline" onPress={handleExport}>
          {t('settings.data.export')}
        </AppButton>

        {confirmingDelete ? (
          <YStack gap="3" bg="dangerSoft" rounded="2xl" p="4">
            <Text fontWeight="700" color="danger">
              {t('settings.data.deleteQuestion')}
            </Text>
            <XStack gap="2" flexWrap="wrap">
              <AppButton variant="danger" size="sm" onPress={handleDelete}>
                {t('settings.data.deleteConfirm')}
              </AppButton>
              <AppButton variant="ghost" size="sm" onPress={() => setConfirmingDelete(false)}>
                {t('common.cancel')}
              </AppButton>
            </XStack>
          </YStack>
        ) : (
          <AppButton variant="danger" icon="trash-outline" onPress={() => setConfirmingDelete(true)}>
            {t('settings.data.delete')}
          </AppButton>
        )}

        {notice ? (
          <XStack role="status" aria-live="polite" gap="2" items="center" bg="brandSoft" rounded="lg" px="3" py="2">
            <Text flex={1} color="brandInk" fontSize="sm" fontWeight="600">
              {t(`settings.data.${notice}`)}
            </Text>
          </XStack>
        ) : null}
        {failed ? <ErrorMessage>{t('common.saveFailed')}</ErrorMessage> : null}
      </Card>
    </Screen>
  );
}
