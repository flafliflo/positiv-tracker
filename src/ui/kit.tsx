/**
 * Kleine, eigene Komponenten-Bibliothek auf Basis von Tamagui.
 * Alle Screens bauen auf diesen Bausteinen auf – so sieht die App überall gleich aus
 * und Farben/Abstände lassen sich an einer Stelle ändern.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { H1, H2, Input, ScrollView, styled, Text, TextArea, useTheme, View, XStack, YStack } from 'tamagui';

import type { PaletteColor } from './palette';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icon in einer Farbe aus der Palette (passt sich Hell/Dunkel an). */
export function Icon({ name, size = 20, color = 'ink' }: { name: IconName; size?: number; color?: PaletteColor }) {
  const theme = useTheme();
  return <Ionicons name={name} size={size} color={theme[color]?.val as string} aria-hidden />;
}

/**
 * Basis für alles Klickbare: im Web ein echtes <button> (Tastatur, Fokus),
 * nativ eine drückbare View mit Rolle "button".
 */
const Pressable = styled(View, {
  role: 'button',
  render: <button type="button" />,
  tabIndex: 0,
  flexDirection: 'row',
  items: 'center',
  justify: 'center',
  borderWidth: 0,
  cursor: 'web:pointer',
  transition: 'quick',
  // Tamagui v3: Zustände stehen als Präfix im Wert (press:, hover:, focus-visible:).
  scale: 'press:0.97',
  opacity: 'hover:0.92 press:0.85',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
  outlineOffset: 'focus-visible:2px',

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none' },
    },
  } as const,
});

type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger';

const BUTTON_COLORS: Record<ButtonVariant, { bg: PaletteColor | 'transparent'; text: PaletteColor }> = {
  primary: { bg: 'brand', text: 'onBrand' },
  soft: { bg: 'brandSoft', text: 'brandInk' },
  ghost: { bg: 'cardAlt', text: 'ink' },
  danger: { bg: 'dangerSoft', text: 'danger' },
};

type AppButtonProps = {
  children: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
};

export function AppButton({ children, onPress, variant = 'primary', size = 'md', icon, disabled, testID }: AppButtonProps) {
  const colors = BUTTON_COLORS[variant];
  const small = size === 'sm';

  return (
    <Pressable
      // Fester Name für Screenreader – sonst würden Icon/Emoji mit vorgelesen.
      aria-label={children}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      aria-disabled={disabled}
      testID={testID}
      bg={colors.bg}
      gap="2"
      px={small ? '3' : '5'}
      minH={small ? 36 : 52}
      rounded={small ? 'lg' : '2xl'}
    >
      {icon ? <Icon name={icon} size={small ? 16 : 20} color={colors.text} /> : null}
      <Text color={colors.text} fontSize={small ? 'sm' : 'base'} fontWeight="700">
        {children}
      </Text>
    </Pressable>
  );
}

type ChipProps = {
  children: string;
  selected: boolean;
  onPress: () => void;
  /** Emoji oder kurzes Symbol vor dem Text. */
  emoji?: string;
  /** Beschriftung für Screenreader, falls der sichtbare Text allein nicht genügt. */
  label?: string;
};

/** Auswahl-Pille für Radiogruppen (Kategorie, Zeitraum, Sprache). */
export function Chip({ children, selected, onPress, emoji, label }: ChipProps) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label ?? children}
      onPress={onPress}
      bg={selected ? 'brand' : 'cardAlt'}
      gap="1.5"
      px="3"
      minH={40}
      rounded="full"
    >
      {emoji ? (
        <Text fontSize="base" aria-hidden>
          {emoji}
        </Text>
      ) : null}
      <Text color={selected ? 'onBrand' : 'ink'} fontSize="sm" fontWeight="600">
        {children}
      </Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  /** Beschriftung für Screenreader – ein Icon allein sagt ihnen nichts. */
  label: string;
  onPress: () => void;
  color?: PaletteColor;
  bg?: PaletteColor | 'transparent';
  testID?: string;
};

export function IconButton({ icon, label, onPress, color = 'muted', bg = 'transparent', testID }: IconButtonProps) {
  return (
    <Pressable aria-label={label} onPress={onPress} testID={testID} bg={bg} w={40} h={40} rounded="full">
      <Icon name={icon} size={20} color={color} />
    </Pressable>
  );
}

/** Weisse (bzw. dunkle) Karte mit weichem Schatten. */
export const Card = styled(YStack, {
  bg: 'card',
  rounded: '3xl',
  p: '5',
  gap: '4',
  borderWidth: 1,
  borderColor: 'line',
  boxShadow: '0 8px 24px var(--shade)',
});

export function SectionTitle({ children }: { children: string }) {
  return (
    <H2 fontSize="lg" fontWeight="700" color="ink">
      {children}
    </H2>
  );
}

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text fontSize="sm" fontWeight="600" color="muted">
      {children}
    </Text>
  );
}

export const TextField = styled(Input, {
  bg: 'cardAlt',
  color: 'ink',
  borderWidth: 1,
  borderColor: 'line',
  rounded: 'xl',
  px: '4',
  minH: 52,
  fontSize: 'base',
  placeholderTextColor: 'muted',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
});

export const TextAreaField = styled(TextArea, {
  bg: 'cardAlt',
  color: 'ink',
  borderWidth: 1,
  borderColor: 'line',
  rounded: 'xl',
  px: '4',
  py: '3',
  minH: 120,
  fontSize: 'base',
  placeholderTextColor: 'muted',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
});

/** Fehlermeldung, die Screenreader sofort vorlesen. */
export function ErrorMessage({ children }: { children: string }) {
  return (
    <XStack gap="2" items="center" bg="dangerSoft" rounded="lg" px="3" py="2">
      <Icon name="alert-circle" size={18} color="danger" />
      <Text role="alert" aria-live="polite" flex={1} color="danger" fontSize="sm" fontWeight="600">
        {children}
      </Text>
    </XStack>
  );
}

export function EmptyState({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <YStack items="center" gap="2" py="8" px="4">
      <Text fontSize="5xl" aria-hidden>
        {emoji}
      </Text>
      <Text fontSize="lg" fontWeight="700" color="ink" text="center">
        {title}
      </Text>
      <Text color="muted" text="center">
        {body}
      </Text>
    </YStack>
  );
}

type StatTileProps = { testID?: string; emoji: string; label: string; value: string };

/** Kachel mit einer Kennzahl, z. B. Wins heute. */
export function StatTile({ testID, emoji, label, value }: StatTileProps) {
  return (
    <YStack
      testID={testID}
      grow={1}
      shrink={1}
      flexBasis={140}
      bg="card"
      rounded="2xl"
      p="4"
      gap="1"
      borderWidth={1}
      borderColor="line"
    >
      <Text fontSize="2xl" aria-hidden>
        {emoji}
      </Text>
      <Text fontSize="2xl" fontWeight="800" color="ink">
        {value}
      </Text>
      <Text fontSize="sm" color="muted">
        {label}
      </Text>
    </YStack>
  );
}

type ScreenProps = {
  title: string;
  subtitle?: string;
  /** Element rechts oben, z. B. ein Icon-Button. */
  action?: ReactNode;
  children: ReactNode;
};

/** Seitenrahmen: scrollbar, zentriert, mit grossem Titel. Unten Platz für die Tab-Leiste. */
export function Screen({ title, subtitle, action, children }: ScreenProps) {
  return (
    <ScrollView flex={1} bg="page" keyboardShouldPersistTaps="handled">
      <YStack w="100%" maxW={680} self="center" gap="5" px="4" pt="8" pb={120}>
        <XStack justify="space-between" items="flex-start" gap="4">
          <YStack flex={1} gap="1">
            <H1 fontSize="4xl" fontWeight="800" color="ink" letterSpacing={-0.5}>
              {title}
            </H1>
            {subtitle ? (
              <Text fontSize="lg" color="muted">
                {subtitle}
              </Text>
            ) : null}
          </YStack>
          {action}
        </XStack>
        {children}
      </YStack>
    </ScrollView>
  );
}
