import { screen, userEvent, within } from '@testing-library/react-native';

import { createInMemoryRepositories } from '@/app-data/repositories';
import { renderWithProviders, TEST_NOW } from '@/test-utils/render-with-providers';

import type { Win } from '../../domain/win';
import { WinsScreen } from '../wins-screen';

const older: Win = { id: 'a', text: 'Older win', category: 'work', day: '2026-11-12', createdAt: '2026-11-12T10:00:00.000Z' };
const newer: Win = { id: 'b', text: 'Newer win', category: 'learning', day: '2026-11-14', createdAt: '2026-11-14T10:00:00.000Z' };

describe('WinsScreen', () => {
  describe('in all three languages', () => {
    it.each([
      ['de', 'Wins', 'Noch keine Wins', 'Win speichern'],
      ['it', 'Successi', 'Ancora nessun successo', 'Salva successo'],
      ['en', 'Wins', 'No wins yet', 'Save win'],
    ] as const)('%s: shows title, empty state and save button', async (language, title, empty, save) => {
      await renderWithProviders(<WinsScreen />, { language });

      expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
      expect(await screen.findByText(empty)).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: save })).toBeOnTheScreen();
    });

    it.each([
      ['de', 'Win speichern', 'Gesundheit', 'Heute'],
      ['it', 'Salva successo', 'Salute', 'Oggi'],
      ['en', 'Save win', 'Health', 'Today'],
    ] as const)('%s: captures a win and shows it with category and day', async (language, save, category, day) => {
      const user = userEvent.setup();
      const { i18n } = await renderWithProviders(<WinsScreen />, { language });

      await user.type(await screen.findByLabelText(i18n.t('wins.form.textLabel')), '10 km gelaufen');
      await user.press(screen.getByRole('radio', { name: category }));
      await user.press(screen.getByRole('button', { name: save }));

      const item = within(await screen.findByTestId('win-item-id-1'));
      expect(item.getByText('10 km gelaufen')).toBeOnTheScreen();
      expect(item.getByText(category)).toBeOnTheScreen();
      expect(item.getByText(day)).toBeOnTheScreen();
    });
  });

  it('stores the captured win and clears the input', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<WinsScreen />);

    const input = await screen.findByLabelText('Your win');
    await user.type(input, '  Read 30 pages  ');
    await user.press(screen.getByRole('button', { name: 'Save win' }));

    await screen.findByTestId('win-item-id-1');
    expect(await repositories.wins.list()).toEqual([
      { id: 'id-1', text: 'Read 30 pages', category: 'other', day: '2026-11-15', createdAt: TEST_NOW().toISOString() },
    ]);
    expect(input).toHaveDisplayValue('');
    expect(screen.queryByText('No wins yet')).not.toBeOnTheScreen();
  });

  it('shows a validation message and saves nothing when the text is empty', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<WinsScreen />);

    await user.press(await screen.findByRole('button', { name: 'Save win' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Write down briefly what went well.');
    expect(await repositories.wins.list()).toEqual([]);
  });

  it('lists earlier wins newest first, with a formatted date', async () => {
    await renderWithProviders(<WinsScreen />, { seed: { wins: [older, newer] } });

    await screen.findByText('Older win');
    expect(screen.getAllByTestId(/^win-item-/).map((item) => item.props.testID)).toEqual(['win-item-b', 'win-item-a']);
    expect(within(screen.getByTestId('win-item-b')).getByText('Yesterday')).toBeOnTheScreen();
    expect(within(screen.getByTestId('win-item-a')).getByText('12 November 2026')).toBeOnTheScreen();
  });

  it('edits a win', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<WinsScreen />, { seed: { wins: [older] } });

    const item = within(await screen.findByTestId('win-item-a'));
    await user.press(item.getByRole('button', { name: 'Edit' }));
    const input = item.getByDisplayValue('Older win');
    await user.clear(input);
    await user.type(input, 'Improved win');
    await user.press(item.getByRole('radio', { name: 'Health' }));
    await user.press(item.getByRole('button', { name: 'Save change' }));

    expect(await screen.findByText('Improved win')).toBeOnTheScreen();
    expect(await repositories.wins.list()).toMatchObject([{ id: 'a', text: 'Improved win', category: 'health', day: '2026-11-12' }]);
  });

  it('deletes a win only after confirmation', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<WinsScreen />, { seed: { wins: [older] } });

    const item = within(await screen.findByTestId('win-item-a'));
    await user.press(item.getByRole('button', { name: 'Delete' }));
    expect(item.getByText('Really delete?')).toBeOnTheScreen();
    expect(await repositories.wins.list()).toHaveLength(1);

    await user.press(item.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('No wins yet')).toBeOnTheScreen();
    expect(await repositories.wins.list()).toEqual([]);
  });

  it('shows an error when saving fails and keeps the typed text', async () => {
    const user = userEvent.setup();
    const repositories = createInMemoryRepositories();
    repositories.wins.upsert = async () => {
      throw new Error('storage full');
    };
    await renderWithProviders(<WinsScreen />, { repositories });

    const input = await screen.findByLabelText('Your win');
    await user.type(input, 'Something good');
    await user.press(screen.getByRole('button', { name: 'Save win' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This could not be saved. Please try again.');
    expect(input).toHaveDisplayValue('Something good');
  });

  it('shows an error when loading fails', async () => {
    const repositories = createInMemoryRepositories();
    repositories.wins.list = async () => {
      throw new Error('storage unavailable');
    };
    await renderWithProviders(<WinsScreen />, { repositories });

    expect(await screen.findByRole('alert')).toHaveTextContent('Your data could not be loaded.');
  });
});
