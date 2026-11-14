import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { AppButton, Card, ErrorMessage, Footnote, Icon, IconButton, Screen, Section } from '@/ui/kit';

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
      action={<IconButton icon="arrow-left" label={t('settings.back')} onPress={onBack} bg="card" color="ink" />}
    >
      <Section title={t('settings.language')}>
        <LanguageSwitcher />
      </Section>

      <Section title={t('settings.data.title')}>
        <Card>
          <AppButton variant="soft" icon="tray-arrow-down" onPress={handleExport}>
            {t('settings.data.export')}
          </AppButton>

          {confirmingDelete ? (
            <YStack gap={12}>
              <Text fontSize={17} fontWeight="600" color="danger">
                {t('settings.data.deleteQuestion')}
              </Text>
              <XStack gap={8} flexWrap="wrap">
                <AppButton variant="danger" size="sm" onPress={handleDelete}>
                  {t('settings.data.deleteConfirm')}
                </AppButton>
                <AppButton variant="ghost" size="sm" onPress={() => setConfirmingDelete(false)}>
                  {t('common.cancel')}
                </AppButton>
              </XStack>
            </YStack>
          ) : (
            <AppButton variant="danger" icon="trash-can-outline" onPress={() => setConfirmingDelete(true)}>
              {t('settings.data.delete')}
            </AppButton>
          )}

          {notice ? (
            <XStack gap={6} items="center">
              <Icon name="check-circle" size={18} color="brand" />
              <Text role="status" aria-live="polite" flex={1} color="brandInk" fontSize={15} fontWeight="600">
                {t(`settings.data.${notice}`)}
              </Text>
            </XStack>
          ) : null}
          {failed ? <ErrorMessage>{t('common.saveFailed')}</ErrorMessage> : null}
        </Card>
        <Footnote>{t('privacy.localOnly')}</Footnote>
      </Section>
    </Screen>
  );
}
