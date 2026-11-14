import { useRouter } from 'expo-router';

import { SettingsScreen } from '@/features/settings/ui/settings-screen';

export default function SettingsRoute() {
  const router = useRouter();

  return <SettingsScreen onBack={() => router.push('/')} />;
}
