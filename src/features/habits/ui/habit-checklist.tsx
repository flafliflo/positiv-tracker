import { useTranslation } from 'react-i18next';
import { Text, XStack, YStack } from 'tamagui';

import { useAppData } from '@/app-data/app-data-provider';
import { EntryActions } from '@/ui/entry-actions';
import { Group, Icon, Row } from '@/ui/kit';

import { habitStreak, isChecked, type Habit } from '../domain/habit';

type Props = {
  /** Mit Löschen-Knopf pro Gewohnheit (Verwaltung) oder nur zum Abhaken (Heute-Ansicht). */
  manage?: boolean;
};

/** Liste aller Gewohnheiten zum Abhaken für heute, mit Serie pro Gewohnheit. */
export function HabitChecklist({ manage = false }: Props) {
  const { data } = useAppData();

  return (
    <Group role="list">
      {data.habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} manage={manage} />
      ))}
    </Group>
  );
}

function HabitRow({ habit, manage }: { habit: Habit; manage: boolean }) {
  const { t } = useTranslation();
  const { data, today, actions } = useAppData();
  const done = isChecked(data.habitChecks, habit.id, today);
  const streak = habitStreak(data.habitChecks, habit.id, today);

  return (
    <Row role="listitem" flexWrap="wrap">
      <YStack
        role="checkbox"
        render={<button type="button" />}
        tabIndex={0}
        aria-checked={done}
        aria-label={t('habits.done', { name: habit.name })}
        onPress={() => void actions.toggleHabit(habit.id, today)}
        w={30}
        h={30}
        rounded={15}
        items="center"
        justify="center"
        bg={done ? 'brand' : 'transparent'}
        borderWidth={2}
        borderColor={done ? 'brand' : 'muted'}
        cursor="web:pointer"
        transition="quick"
        scale="press:0.85"
        outlineColor="focus-visible:brand"
        outlineStyle="focus-visible:solid"
        outlineWidth="focus-visible:3px"
        outlineOffset="focus-visible:2px"
      >
        {done ? <Icon name="check-bold" size={18} color="onBrand" /> : null}
      </YStack>

      <Text flex={1} fontSize={17} color="ink">
        {habit.name}
      </Text>

      <XStack role="img" aria-label={t('habits.streak', { name: habit.name, count: streak })} gap={2} items="center">
        <Icon name="fire" size={18} color={streak > 0 ? 'accent' : 'muted'} />
        <Text fontSize={15} fontWeight="600" color={streak > 0 ? 'accentInk' : 'muted'} aria-hidden>
          {streak}
        </Text>
      </XStack>

      {manage ? (
        <EntryActions deleteLabel={t('habits.remove', { name: habit.name })} onDelete={() => void actions.removeHabit(habit.id)} />
      ) : null}
    </Row>
  );
}
