import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { EntryActions } from '@/ui/entry-actions';
import { Icon } from '@/ui/kit';

import { habitStreak, isChecked, type Habit } from '../domain/habit';

type Props = {
  /** Mit Löschen-Knopf pro Gewohnheit (Verwaltung) oder nur zum Abhaken (Heute-Ansicht). */
  manage?: boolean;
};

/** Liste aller Gewohnheiten zum Abhaken für heute, mit Serie pro Gewohnheit. */
export function HabitChecklist({ manage = false }: Props) {
  const { data } = useAppData();

  return (
    <YStack role="list" gap="2">
      {data.habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} manage={manage} />
      ))}
    </YStack>
  );
}

function HabitRow({ habit, manage }: { habit: Habit; manage: boolean }) {
  const { t } = useTranslation();
  const { data, today, actions } = useAppData();
  const done = isChecked(data.habitChecks, habit.id, today);
  const streak = habitStreak(data.habitChecks, habit.id, today);

  return (
    <XStack role="listitem" gap="3" items="center" bg={done ? 'brandSoft' : 'cardAlt'} rounded="2xl" px="3" py="2" minH={56} transition="quick">
      <YStack
        role="checkbox"
        render={<button type="button" />}
        tabIndex={0}
        aria-checked={done}
        aria-label={t('habits.done', { name: habit.name })}
        onPress={() => void actions.toggleHabit(habit.id, today)}
        w={36}
        h={36}
        rounded="full"
        items="center"
        justify="center"
        bg={done ? 'brand' : 'card'}
        borderWidth={2}
        borderColor={done ? 'brand' : 'muted'}
        cursor="web:pointer"
        transition="quick"
        scale="press:0.9"
        outlineColor="focus-visible:brand"
        outlineStyle="focus-visible:solid"
        outlineWidth="focus-visible:3px"
        outlineOffset="focus-visible:2px"
      >
        {done ? <Icon name="checkmark" size={20} color="onBrand" /> : null}
      </YStack>

      <Text flex={1} fontSize="base" fontWeight="600" color={done ? 'brandInk' : 'ink'}>
        {habit.name}
      </Text>

      <XStack role="img" aria-label={t('habits.streak', { name: habit.name, count: streak })} gap="1" items="center" bg="accentSoft" rounded="full" px="2.5" py="1">
        <Text fontSize="sm" aria-hidden>
          🔥
        </Text>
        <Text fontSize="sm" fontWeight="700" color="accentInk" aria-hidden>
          {streak}
        </Text>
      </XStack>

      {manage ? (
        <EntryActions deleteLabel={t('habits.remove', { name: habit.name })} onDelete={() => void actions.removeHabit(habit.id)} />
      ) : null}
    </XStack>
  );
}
