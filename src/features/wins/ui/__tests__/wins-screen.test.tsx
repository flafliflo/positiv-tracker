import { screen, userEvent, within } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render-with-providers';

import { InMemoryWinRepository } from '../../data/in-memory-win-repository';
import type { WinRepository } from '../../data/win-repository';
import type { Win } from '../../domain/win';
import { WinsScreen } from '../wins-screen';

const now = () => new Date(2026, 10, 14, 21, 30);

function renderScreen(options: Parameters<typeof renderWithProviders>[1] = {}) {
  let nextId = 1;
  return renderWithProviders(<WinsScreen now={now} generateId={() => `win-${nextId++}`} />, options);
}

describe('WinsScreen', () => {
  describe('in all three languages', () => {
    it.each([
      ['de', 'Meine Wins', 'Noch keine Wins', 'Win speichern'],
      ['it', 'I miei successi', 'Ancora nessun successo', 'Salva successo'],
      ['en', 'My wins', 'No wins yet', 'Save win'],
    ] as const)('%s: shows title, empty state and save button', async (language, title, empty, save) => {
      await renderScreen({ language });

      expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
      expect(await screen.findByText(empty)).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: save })).toBeOnTheScreen();
    });

    it.each([
      ['de', 'Win speichern', 'Gesundheit', '14. November 2026'],
      ['it', 'Salva successo', 'Salute', '14 novembre 2026'],
      ['en', 'Save win', 'Health', '14 November 2026'],
    ] as const)('%s: captures a win and shows it with category and date', async (language, save, category, date) => {
      const user = userEvent.setup();
      const { i18n } = await renderScreen({ language });

      await user.type(screen.getByLabelText(i18n.t('wins.form.textLabel')), '10 km gelaufen');
      await user.press(screen.getByRole('radio', { name: category }));
      await user.press(screen.getByRole('button', { name: save }));

      const item = within(await screen.findByTestId('win-item-win-1'));
      expect(item.getByText('10 km gelaufen')).toBeOnTheScreen();
      expect(item.getByText(category)).toBeOnTheScreen();
      expect(item.getByText(date)).toBeOnTheScreen();
    });
  });

  it('stores the captured win in the repository and clears the input', async () => {
    const user = userEvent.setup();
    const winRepository = new InMemoryWinRepository();
    await renderScreen({ winRepository });

    const input = screen.getByLabelText('Your win');
    await user.type(input, '  Read 30 pages  ');
    await user.press(screen.getByRole('button', { name: 'Save win' }));

    await screen.findByTestId('win-item-win-1');
    expect(await winRepository.list()).toEqual([
      {
        id: 'win-1',
        text: 'Read 30 pages',
        category: 'other',
        day: '2026-11-14',
        createdAt: now().toISOString(),
      },
    ]);
    expect(input).toHaveDisplayValue('');
    expect(screen.queryByText('No wins yet')).not.toBeOnTheScreen();
  });

  it('shows a validation message and saves nothing when the text is empty', async () => {
    const user = userEvent.setup();
    const winRepository = new InMemoryWinRepository();
    await renderScreen({ winRepository });

    await user.press(screen.getByRole('button', { name: 'Save win' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Write down briefly what went well.');
    expect(await winRepository.list()).toEqual([]);
  });

  it('clears the validation message once a valid win is saved', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Save win' }));
    await screen.findByRole('alert');
    await user.type(screen.getByLabelText('Your win'), 'Cooked dinner');
    await user.press(screen.getByRole('button', { name: 'Save win' }));

    await screen.findByTestId('win-item-win-1');
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('lists previously saved wins, newest first', async () => {
    const older: Win = { id: 'a', text: 'Older win', category: 'work', day: '2026-11-12', createdAt: '2026-11-12T10:00:00.000Z' };
    const newer: Win = { id: 'b', text: 'Newer win', category: 'learning', day: '2026-11-13', createdAt: '2026-11-13T10:00:00.000Z' };
    await renderScreen({ winRepository: new InMemoryWinRepository([older, newer]) });

    await screen.findByText('Older win');
    const texts = screen.getAllByTestId(/^win-item-/).map((item) => item.props.testID);
    expect(texts).toEqual(['win-item-b', 'win-item-a']);
  });

  it('selects "Other" as the default category and marks the chosen one', async () => {
    const user = userEvent.setup();
    await renderScreen();

    expect(screen.getByRole('radio', { name: 'Other' })).toBeChecked();
    await user.press(screen.getByRole('radio', { name: 'Health' }));

    expect(screen.getByRole('radio', { name: 'Health' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Other' })).not.toBeChecked();
  });

  it('shows an error when saving fails and keeps the typed text', async () => {
    const user = userEvent.setup();
    const failing: WinRepository = {
      list: async () => [],
      add: async () => {
        throw new Error('storage full');
      },
    };
    await renderScreen({ winRepository: failing });

    const input = screen.getByLabelText('Your win');
    await user.type(input, 'Something good');
    await user.press(screen.getByRole('button', { name: 'Save win' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The win could not be saved. Please try again.');
    expect(input).toHaveDisplayValue('Something good');
  });

  it('shows an error when loading fails', async () => {
    const failing: WinRepository = {
      list: async () => {
        throw new Error('storage unavailable');
      },
      add: async () => {},
    };
    await renderScreen({ winRepository: failing });

    expect(await screen.findByRole('alert')).toHaveTextContent('Your wins could not be loaded.');
  });
});
