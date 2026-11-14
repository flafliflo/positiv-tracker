import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';

import { i18n, repositories } from '@/composition-root';
import { AppProviders } from '@/providers/app-providers';
import { TabBar, TabButton } from '@/ui/tab-bar';

export default function RootLayout() {
  return (
    <AppProviders i18n={i18n} repositories={repositories}>
      <AppTabs />
    </AppProviders>
  );
}

/** Fünf Haupt-Tabs; die Einstellungen sind eine eigene Seite ohne Tab-Knopf. */
function AppTabs() {
  const { t } = useTranslation();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <TabBar label={t('tabs.label')}>
          <TabTrigger name="today" href="/" asChild>
            <TabButton icon="today-outline" label={t('tabs.today')} />
          </TabTrigger>
          <TabTrigger name="wins" href="/wins" asChild>
            <TabButton icon="trophy-outline" label={t('tabs.wins')} />
          </TabTrigger>
          <TabTrigger name="journal" href="/journal" asChild>
            <TabButton icon="chatbubble-ellipses-outline" label={t('tabs.journal')} />
          </TabTrigger>
          <TabTrigger name="health" href="/health" asChild>
            <TabButton icon="heart-outline" label={t('tabs.health')} />
          </TabTrigger>
          <TabTrigger name="progress" href="/progress" asChild>
            <TabButton icon="stats-chart-outline" label={t('tabs.progress')} />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" style={{ display: 'none' }} />
        </TabBar>
      </TabList>
    </Tabs>
  );
}
