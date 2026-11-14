/**
 * Kleine, eigene Komponenten-Bibliothek auf Basis von Tamagui.
 * Alle Screens bauen auf diesen Bausteinen auf – so sieht die App überall gleich aus
 * und Farben/Abstände lassen sich an einer Stelle ändern.
 *
 * Stil: der vertraute Aufbau etablierter Apps – gruppierte Listen mit Trennlinien,
 * farbige Icon-Flächen pro Bereich, klare Schriftstufen (34 / 20 / 17 / 15 / 13).
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Children, Fragment, type ComponentProps, type ReactNode } from 'react';
import { H1, H2, Input, ScrollView, styled, Text, TextArea, useTheme, View, XStack, YStack } from 'tamagui';

import type { PaletteColor } from './palette';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Icon in einer Farbe aus der Palette (passt sich Hell/Dunkel an). Eine Icon-Familie für die ganze App. */
export function Icon({ name, size = 22, color = 'ink' }: { name: IconName; size?: number; color?: PaletteColor }) {
  const theme = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={theme[color]?.val as string} aria-hidden />;
}

/** Farbige Icon-Fläche, die einen Bereich kennzeichnet (z. B. Schlaf, Wasser, Wins). */
export function IconChip({ icon, color, size = 30 }: { icon: IconName; color: PaletteColor; size?: number }) {
  return (
    <YStack w={size} h={size} rounded={size * 0.27} bg={color} items="center" justify="center">
      <Icon name={icon} size={size * 0.62} color="onCat" />
    </YStack>
  );
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
  opacity: 'hover:0.88 press:0.6',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
  outlineOffset: 'focus-visible:2px',

  variants: {
    disabled: {
      true: { opacity: 0.4, pointerEvents: 'none' },
    },
  } as const,
});

type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger';

const BUTTON_COLORS: Record<ButtonVariant, { bg: PaletteColor; text: PaletteColor }> = {
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
      // Fester Name für Screenreader – sonst würde das Icon mit vorgelesen.
      aria-label={children}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      aria-disabled={disabled}
      testID={testID}
      bg={colors.bg}
      gap={6}
      px={small ? 14 : 18}
      minH={small ? 34 : 50}
      rounded={small ? 17 : 12}
    >
      {icon ? <Icon name={icon} size={small ? 17 : 20} color={colors.text} /> : null}
      <Text color={colors.text} fontSize={small ? 15 : 17} fontWeight="600">
        {children}
      </Text>
    </Pressable>
  );
}

type ChipProps = {
  children: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Beschriftung für Screenreader, falls der sichtbare Text allein nicht genügt. */
  label?: string;
};

/** Auswahl-Pille für Radiogruppen (z. B. Kategorie). */
export function Chip({ children, selected, onPress, icon, label }: ChipProps) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label ?? children}
      onPress={onPress}
      bg={selected ? 'brand' : 'cardAlt'}
      gap={6}
      px={14}
      minH={36}
      rounded={18}
    >
      {icon ? <Icon name={icon} size={17} color={selected ? 'onBrand' : 'muted'} /> : null}
      <Text color={selected ? 'onBrand' : 'ink'} fontSize={15} fontWeight="600">
        {children}
      </Text>
    </Pressable>
  );
}

/** Umschaltleiste (Segmented Control): genau eine Option ist gewählt. */
export function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <XStack role="radiogroup" aria-label={label} bg="cardAlt" rounded={10} p={2} gap={2}>
      {children}
    </XStack>
  );
}

type SegmentProps = { children: string; selected: boolean; onPress: () => void; label?: string };

export function Segment({ children, selected, onPress, label }: SegmentProps) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label ?? children}
      onPress={onPress}
      grow={1}
      shrink={1}
      flexBasis={0}
      px={12}
      minH={32}
      rounded={8}
      bg={selected ? 'segment' : 'transparent'}
      boxShadow={selected ? '0 1px 3px var(--shade)' : 'none'}
    >
      <Text color="ink" fontSize={13} fontWeight={selected ? '700' : '500'} numberOfLines={1}>
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
    <Pressable aria-label={label} onPress={onPress} testID={testID} bg={bg} w={40} h={40} rounded={20}>
      <Icon name={icon} size={22} color={color} />
    </Pressable>
  );
}

/** Einfache Fläche für Formulare und freie Inhalte. */
export const Card = styled(YStack, {
  bg: 'card',
  rounded: 14,
  p: 16,
  gap: 14,
});

/** Trennlinie zwischen Zeilen, links eingerückt wie in System-Listen. */
function Separator() {
  return <YStack h={1} bg="line" ml={16} />;
}

type GroupProps = ComponentProps<typeof YStack> & { children: ReactNode };

/** Gruppierte Liste: mehrere Zeilen in einer Fläche, durch feine Linien getrennt. */
export function Group({ children, ...props }: GroupProps) {
  const rows = Children.toArray(children);

  return (
    <YStack bg="card" rounded={14} overflow="hidden" {...props}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <Separator /> : null}
          {row}
        </Fragment>
      ))}
    </YStack>
  );
}

/** Eine Zeile in einer Gruppe. */
export const Row = styled(XStack, {
  items: 'center',
  gap: 12,
  px: 16,
  py: 11,
  minH: 52,
});

type ValueRowProps = { testID?: string; icon: IconName; color: PaletteColor; label: string; value: string };

/** Zeile „Bezeichnung … Wert" mit farbigem Bereichs-Icon. */
export function ValueRow({ testID, icon, color, label, value }: ValueRowProps) {
  return (
    <Row testID={testID}>
      <IconChip icon={icon} color={color} />
      <Text flex={1} fontSize={17} color="ink">
        {label}
      </Text>
      <Text fontSize={17} fontWeight="600" color="ink">
        {value}
      </Text>
    </Row>
  );
}

/** Abschnitt mit Überschrift; die Überschrift steht näher am Inhalt als am vorherigen Abschnitt. */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <YStack gap={10}>
      <XStack items="center" justify="space-between" gap={12} px={4} flexWrap="wrap">
        <SectionTitle>{title}</SectionTitle>
        {action}
      </XStack>
      {children}
    </YStack>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <H2 fontSize={20} fontWeight="700" color="ink">
      {children}
    </H2>
  );
}

export function FieldLabel({ children }: { children: string }) {
  return (
    <Text fontSize={13} fontWeight="600" color="muted">
      {children}
    </Text>
  );
}

/** Kleiner erklärender Text unter einer Gruppe. */
export function Footnote({ children }: { children: string }) {
  return (
    <Text fontSize={13} color="muted" px={4}>
      {children}
    </Text>
  );
}

export const TextField = styled(Input, {
  bg: 'cardAlt',
  color: 'ink',
  borderWidth: 0,
  rounded: 10,
  px: 12,
  minH: 44,
  fontSize: 17,
  placeholderTextColor: 'muted',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
});

export const TextAreaField = styled(TextArea, {
  bg: 'cardAlt',
  color: 'ink',
  borderWidth: 0,
  rounded: 10,
  px: 12,
  py: 10,
  minH: 110,
  fontSize: 17,
  placeholderTextColor: 'muted',
  outlineColor: 'focus-visible:brand',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:3px',
});

/** Fehlermeldung, die Screenreader sofort vorlesen. */
export function ErrorMessage({ children }: { children: string }) {
  return (
    <XStack gap={6} items="center">
      <Icon name="alert-circle" size={18} color="danger" />
      <Text role="alert" aria-live="polite" flex={1} color="danger" fontSize={15} fontWeight="600">
        {children}
      </Text>
    </XStack>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <YStack items="center" gap={6} py={28} px={16}>
      <Icon name={icon} size={44} color="muted" />
      <Text fontSize={20} fontWeight="700" color="ink" text="center" mt={6}>
        {title}
      </Text>
      <Text fontSize={15} color="muted" text="center">
        {body}
      </Text>
    </YStack>
  );
}

type ScreenProps = {
  title: string;
  subtitle?: string;
  /** Element rechts oben, z. B. ein Icon-Knopf. */
  action?: ReactNode;
  children: ReactNode;
};

/** Seitenrahmen: scrollbar, zentriert, mit grossem Titel. Unten Platz für die Tab-Leiste. */
export function Screen({ title, subtitle, action, children }: ScreenProps) {
  return (
    <ScrollView flex={1} bg="page" keyboardShouldPersistTaps="handled">
      <YStack w="100%" maxW={640} self="center" gap={28} px={16} pt={28} pb={110}>
        <XStack justify="space-between" items="flex-start" gap={12}>
          <YStack flex={1} gap={2}>
            <H1 fontSize={34} fontWeight="800" color="ink" letterSpacing={-0.6}>
              {title}
            </H1>
            {subtitle ? (
              <Text fontSize={17} color="muted">
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
