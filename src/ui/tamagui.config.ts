import { defaultConfig } from '@tamagui/config/v6';
import { createTamagui } from 'tamagui';

/**
 * Design-Tokens (Farben, Abstände, Schriftgrössen) und Themes (light/dark).
 * Wir starten mit der Standard-Konfiguration v6 und passen sie später ans Branding an.
 */
export const tamaguiConfig = createTamagui(defaultConfig);

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
