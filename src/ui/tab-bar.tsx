import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, View, type PressableProps } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { Icon, type IconName } from './kit';

type TabBarProps = TabListProps & {
  /** Name der Navigation für Screenreader. */
  label: string;
};

/** Schwebende Tab-Leiste am unteren Rand (auf allen Plattformen gleich). */
export function TabBar({ children, label, ...props }: TabBarProps) {
  return (
    <View
      {...props}
      role="navigation"
      aria-label={label}
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, flexDirection: 'row', justifyContent: 'center' }}
    >
      <XStack
        flex={1}
        maxW={520}
        bg="card"
        rounded="3xl"
        p="1.5"
        gap="1"
        borderWidth={1}
        borderColor="line"
        boxShadow="0 10px 30px var(--shade)"
      >
        {children}
      </XStack>
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

/** Ein Tab: im Web ein echter Link (<a href>), der aktive ist für Screenreader markiert. */
export function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...(props as PressableProps)} aria-current={isFocused ? 'page' : undefined} style={{ flex: 1 }}>
      <YStack items="center" justify="center" gap="0.5" py="2" rounded="2xl" bg={isFocused ? 'brandSoft' : 'transparent'} transition="quick">
        <Icon name={icon} size={22} color={isFocused ? 'brandInk' : 'muted'} />
        <Text fontSize="xs" fontWeight={isFocused ? '700' : '600'} color={isFocused ? 'brandInk' : 'muted'} numberOfLines={1}>
          {label}
        </Text>
      </YStack>
    </Pressable>
  );
}
