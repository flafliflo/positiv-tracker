import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, View, type PressableProps } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { Icon, type IconName } from './kit';

type TabBarProps = TabListProps & {
  /** Name der Navigation für Screenreader. */
  label: string;
};

/** Klassische Tab-Leiste am unteren Rand: volle Breite, feine Linie oben. */
export function TabBar({ children, label, ...props }: TabBarProps) {
  return (
    <View {...props} role="navigation" aria-label={label} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
      <XStack bg="card" borderTopWidth={1} borderColor="line" justify="center" px={8} pt={6} pb={8}>
        <XStack flex={1} maxW={640}>
          {children}
        </XStack>
      </XStack>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

/** Ein Tab: im Web ein echter Link (<a href>), der aktive ist für Screenreader markiert. */
export function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  const color = isFocused ? 'brand' : 'muted';

  return (
    <Pressable {...(props as PressableProps)} aria-current={isFocused ? 'page' : undefined} style={{ flex: 1 }}>
      <YStack items="center" justify="center" gap={2} py={4}>
        <Icon name={icon} size={26} color={color} />
        <Text fontSize={11} fontWeight="600" color={color} numberOfLines={1}>
          {label}
        </Text>
      </YStack>
    </Pressable>
  );
}
