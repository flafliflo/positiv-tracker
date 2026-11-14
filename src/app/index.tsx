import { useRouter } from 'expo-router';

import { TodayScreen } from '@/features/today/ui/today-screen';

/** Route "/": Dateien in src/app sind nur dünne Hüllen, die Logik liegt in src/features. */
export default function TodayRoute() {
  const router = useRouter();

  return <TodayScreen onOpenSettings={() => router.push('/settings')} onOpenJournal={() => router.push('/journal')} />;
}
