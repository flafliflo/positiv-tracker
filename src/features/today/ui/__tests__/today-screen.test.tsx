import { screen, userEvent, within } from '@testing-library/react-native';

import { createCheck } from '@/features/habits/domain/habit';
import { emptyHealthDay } from '@/features/health/domain/health-day';
import { renderWithProviders, TEST_TODAY } from '@/test-utils/render-with-providers';

import { promptNumberForDay } from '../../domain/today';
import { TodayScreen } from '../today-screen';

const noop = () => {};
const renderToday = (options: Parameters<typeof renderWithProviders>[1] = {}, props: Partial<Parameters<typeof TodayScreen>[0]> = {}) =>
  renderWithProviders(<TodayScreen onOpenSettings={noop} onOpenJournal={noop} {...props} />, options);

describe('TodayScreen', () => {
  it.each([
    ['de', 'Guten Morgen', /Sonntag.*15.*November/, 'Starte heute deine Serie'],
    ['it', 'Buongiorno', /domenica.*15.*novembre/i, 'Inizia oggi la tua serie'],
    ['en', 'Good morning', /Sunday.*15.*November/, 'Start your streak today'],
  ] as const)('%s: greets, shows the date and invites to start a streak', async (language, greeting, date, streak) => {
    await renderToday({ language });

    expect(await screen.findByRole('heading', { name: greeting })).toBeOnTheScreen();
    expect(screen.getByText(date)).toBeOnTheScreen();
    expect(screen.getByText(streak)).toBeOnTheScreen();
  });

  it('greets by time of day', async () => {
    await renderToday({ now: () => new Date(2026, 10, 15, 20, 0) });

    expect(await screen.findByRole('heading', { name: 'Good evening' })).toBeOnTheScreen();
  });

  it('summarises today: streak, wins, mood, habits and steps', async () => {
    await renderToday({
      seed: {
        wins: [
          { id: 'a', text: 'A', category: 'other', day: TEST_TODAY, createdAt: '2026-11-15T07:00:00.000Z' },
          { id: 'b', text: 'B', category: 'other', day: '2026-11-14', createdAt: '2026-11-14T07:00:00.000Z' },
          { id: 'c', text: 'C', category: 'other', day: '2026-11-13', createdAt: '2026-11-13T07:00:00.000Z' },
        ],
        journal: [{ id: 'j', text: '', mood: 4, day: TEST_TODAY, createdAt: '2026-11-15T08:00:00.000Z' }],
        habits: [
          { id: 'h1', name: 'Read', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' },
          { id: 'h2', name: 'Stretch', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' },
        ],
        habitChecks: [createCheck('h1', TEST_TODAY)],
        health: [{ ...emptyHealthDay(TEST_TODAY), steps: 8421 }],
      },
    });

    expect(await screen.findByText('3 days in a row')).toBeOnTheScreen();
    expect(within(screen.getByTestId('tile-wins')).getByText('1')).toBeOnTheScreen();
    expect(within(screen.getByTestId('tile-mood')).getByText('Good')).toBeOnTheScreen();
    expect(within(screen.getByTestId('tile-habits')).getByText('1/2')).toBeOnTheScreen();
    expect(within(screen.getByTestId('tile-steps')).getByText('8,421')).toBeOnTheScreen();
  });

  it('adds a quick win', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderToday();

    await user.type(await screen.findByLabelText('Quick win'), 'Got up early');
    await user.press(screen.getByRole('button', { name: 'Add' }));

    expect(await within(screen.getByTestId('tile-wins')).findByText('1')).toBeOnTheScreen();
    expect(await screen.findByText('1 day in a row')).toBeOnTheScreen();
    expect(await repositories.wins.list()).toMatchObject([{ text: 'Got up early', category: 'other' }]);
    expect(screen.getByLabelText('Quick win')).toHaveDisplayValue('');
  });

  it('shows the validation message for an empty quick win', async () => {
    const user = userEvent.setup();
    await renderToday();

    await user.press(await screen.findByRole('button', { name: 'Add' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Write down briefly what went well.');
  });

  it('shows the prompt of the day and leads to the journal', async () => {
    const user = userEvent.setup();
    const onOpenJournal = jest.fn();
    const { i18n } = await renderToday({}, { onOpenJournal });

    expect(await screen.findByText(i18n.t(`today.prompt.items.${promptNumberForDay(TEST_TODAY)}`))).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Write down your thoughts' }));

    expect(onOpenJournal).toHaveBeenCalledTimes(1);
  });

  it('lets me tick off habits right on the today screen', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderToday({
      seed: { habits: [{ id: 'h1', name: 'Read', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' }] },
    });

    await user.press(await screen.findByRole('checkbox', { name: 'Read done' }));

    expect(screen.getByRole('checkbox', { name: 'Read done' })).toBeChecked();
    expect(within(screen.getByTestId('tile-habits')).getByText('1/1')).toBeOnTheScreen();
    expect(await repositories.habitChecks.list()).toEqual([createCheck('h1', TEST_TODAY)]);
  });

  it('opens the settings', async () => {
    const user = userEvent.setup();
    const onOpenSettings = jest.fn();
    await renderToday({}, { onOpenSettings });

    await user.press(await screen.findByRole('button', { name: 'Open settings' }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
