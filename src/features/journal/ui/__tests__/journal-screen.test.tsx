import { screen, userEvent, within } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render-with-providers';

import type { JournalEntry } from '../../domain/journal-entry';
import { JournalScreen } from '../journal-screen';

const existing: JournalEntry = { id: 'e', text: 'Long day', mood: 2, day: '2026-11-14', createdAt: '2026-11-14T20:00:00.000Z' };

describe('JournalScreen', () => {
  it.each([
    ['de', 'Gedanken', 'Noch keine Einträge', 'Eintrag speichern'],
    ['it', 'Pensieri', 'Ancora nessuna annotazione', 'Salva annotazione'],
    ['en', 'Thoughts', 'No entries yet', 'Save entry'],
  ] as const)('%s: shows title, empty state and save button', async (language, title, empty, save) => {
    await renderWithProviders(<JournalScreen />, { language });

    expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
    expect(await screen.findByText(empty)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: save })).toBeOnTheScreen();
  });

  it('offers five moods', async () => {
    await renderWithProviders(<JournalScreen />);

    for (const mood of ['Very bad', 'Bad', 'Okay', 'Good', 'Very good']) {
      expect(await screen.findByRole('radio', { name: mood })).not.toBeChecked();
    }
  });

  it('asks for a mood before saving', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<JournalScreen />);

    await user.type(await screen.findByLabelText('Your thoughts'), 'Just text');
    await user.press(screen.getByRole('button', { name: 'Save entry' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose your mood first.');
    expect(await repositories.journal.list()).toEqual([]);
  });

  it('saves an entry with mood and text and resets the form', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<JournalScreen />);

    await user.press(await screen.findByRole('radio', { name: 'Good' }));
    await user.type(screen.getByLabelText('Your thoughts'), 'Productive morning');
    await user.press(screen.getByRole('button', { name: 'Save entry' }));

    const item = within(await screen.findByTestId('journal-item-id-1'));
    expect(item.getByText('Productive morning')).toBeOnTheScreen();
    expect(item.getByText('Good')).toBeOnTheScreen();
    expect(item.getByText('Today')).toBeOnTheScreen();
    expect(await repositories.journal.list()).toMatchObject([{ id: 'id-1', text: 'Productive morning', mood: 4 }]);
    expect(screen.getByLabelText('Your thoughts')).toHaveDisplayValue('');
    expect(screen.getByRole('radio', { name: 'Good' })).not.toBeChecked();
  });

  it('allows a quick check-in with only a mood', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<JournalScreen />);

    await user.press(await screen.findByRole('radio', { name: 'Very good' }));
    await user.press(screen.getByRole('button', { name: 'Save entry' }));

    await screen.findByTestId('journal-item-id-1');
    expect(await repositories.journal.list()).toMatchObject([{ text: '', mood: 5 }]);
  });

  it('edits an entry', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<JournalScreen />, { seed: { journal: [existing] } });

    const item = within(await screen.findByTestId('journal-item-e'));
    await user.press(item.getByRole('button', { name: 'Edit' }));
    await user.press(item.getByRole('radio', { name: 'Okay' }));
    const input = item.getByDisplayValue('Long day');
    await user.clear(input);
    await user.type(input, 'Long but fine');
    await user.press(item.getByRole('button', { name: 'Save change' }));

    expect(await screen.findByText('Long but fine')).toBeOnTheScreen();
    expect(await repositories.journal.list()).toMatchObject([{ id: 'e', text: 'Long but fine', mood: 3 }]);
  });

  it('deletes an entry only after confirmation', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<JournalScreen />, { seed: { journal: [existing] } });

    const item = within(await screen.findByTestId('journal-item-e'));
    await user.press(item.getByRole('button', { name: 'Delete' }));
    await user.press(item.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('No entries yet')).toBeOnTheScreen();
    expect(await repositories.journal.list()).toEqual([]);
  });
});
