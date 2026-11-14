import { animationsCSS } from '@tamagui/config/animations-css';
import { defaultConfig } from '@tamagui/config/v6';
import { createTamagui } from 'tamagui';

import { darkPalette, lightPalette } from './palette';

/**
 * Design-System: Tamagui-Standard (Abstände, Schriftgrössen, Radien) plus unsere
 * eigene Farbpalette für Hell und Dunkel und ein Animations-Treiber.
 */
export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  animations: animationsCSS,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...lightPalette,
      background: lightPalette.page,
      color: lightPalette.ink,
      'placeholder-color': lightPalette.muted,
    },
    dark: {
      ...defaultConfig.themes.dark,
      ...darkPalette,
      background: darkPalette.page,
      color: darkPalette.ink,
      'placeholder-color': darkPalette.muted,
    },
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
