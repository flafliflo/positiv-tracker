import { screen, userEvent, within } from '@testing-library/react-native';

import { emptyHealthDay } from '@/features/health/domain/health-day';
import type { JournalEntry, Mood } from '@/features/journal/domain/journal-entry';
import type { Win } from '@/features/wins/domain/win';
import { renderWithProviders } from '@/test-utils/render-with-providers';

import { ProgressScreen } from '../progress-screen';

const win = (id: string, day: string): Win => ({ id, text: id, category: 'other', day, createdAt: `${day}T10:00:00.000Z` });
const entry = (id: string, day: string, mood: Mood): JournalEntry => ({ id, text: '', mood, day, createdAt: `${day}T10:00:00.000Z` });
const day = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;

describe('ProgressScreen', () => {
  it.each([
    ['de', 'Fortschritt', 'Aktuelle Serie', 'Rückblick'],
    ['it', 'Progressi', 'Serie attuale', 'Riepilogo'],
    ['en', 'Progress', 'Current streak', 'Review'],
  ] as const)('%s: shows title, streak and review', async (language, title, streak, review) => {
    await renderWithProviders(<ProgressScreen />, { language });

    expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
    expect(screen.getByText(streak)).toBeOnTheScreen();
    expect(screen.getByRole('heading', { name: review })).toBeOnTheScreen();
  });

  it('shows current and longest streak', async () => {
    await renderWithProviders(<ProgressScreen />, {
      seed: { wins: [win('a', day(1)), win('b', day(2)), win('c', day(3)), win('d', day(4)), win('e', day(14)), win('f', day(15))] },
    });

    expect(await within(screen.getByTestId('streak-current')).findByText('2 days')).toBeOnTheScreen();
    expect(within(screen.getByTestId('streak-best')).getByText('4 days')).toBeOnTheScreen();
  });

  it('describes each heatmap day for screen readers', async () => {
    await renderWithProviders(<ProgressScreen />, { seed: { wins: [win('a', day(15)), win('b', day(15)), win('c', day(14))] } });

    expect(await screen.findByLabelText('15 November 2026: 2 entries')).toBeOnTheScreen();
    expect(screen.getByLabelText('14 November 2026: 1 entry')).toBeOnTheScreen();
    expect(screen.getByLabelText('13 November 2026: 0 entries')).toBeOnTheScreen();
  });

  it('summarises the last 7 days and switches to 30 days', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<ProgressScreen />, {
      seed: {
        wins: [win('a', day(15)), win('b', day(14)), win('old', day(1))],
        journal: [entry('e1', day(15), 4), entry('e2', day(14), 3)],
        health: [{ ...emptyHealthDay(day(15)), steps: 9000, sleepHours: 7.5, waterGlasses: 6, trainingMinutes: 30 }],
      },
    });

    expect(await screen.findByRole('radio', { name: '7 days' })).toBeChecked();
    expect(within(screen.getByTestId('summary-wins')).getByText('2')).toBeOnTheScreen();
    expect(within(screen.getByTestId('summary-mood')).getByText('3.5')).toBeOnTheScreen();
    expect(within(screen.getByTestId('summary-steps')).getByText('9,000')).toBeOnTheScreen();
    expect(within(screen.getByTestId('summary-sleep')).getByText(/7\.5/)).toBeOnTheScreen();
    expect(within(screen.getByTestId('summary-training')).getByText(/30/)).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: '30 days' }));

    expect(within(screen.getByTestId('summary-wins')).getByText('3')).toBeOnTheScreen();
  });

  it('shows a dash where there is no data', async () => {
    await renderWithProviders(<ProgressScreen />);

    expect(await within(screen.getByTestId('summary-mood')).findByText('–')).toBeOnTheScreen();
    expect(screen.getByText('No mood recorded yet.')).toBeOnTheScreen();
  });

  it('explains what is needed for the mood/steps insight', async () => {
    await renderWithProviders(<ProgressScreen />);

    expect(await screen.findByText(/Record steps and mood on a few days/)).toBeOnTheScreen();
  });

  it('shows how steps relate to mood once there is enough data', async () => {
    await renderWithProviders(<ProgressScreen />, {
      seed: {
        journal: [entry('1', day(1), 5), entry('2', day(2), 4), entry('3', day(3), 5), entry('4', day(4), 3), entry('5', day(5), 4), entry('6', day(6), 3)],
        health: [
          { ...emptyHealthDay(day(1)), steps: 12000 },
          { ...emptyHealthDay(day(2)), steps: 9000 },
          { ...emptyHealthDay(day(3)), steps: 8000 },
          { ...emptyHealthDay(day(4)), steps: 3000 },
          { ...emptyHealthDay(day(5)), steps: 5000 },
          { ...emptyHealthDay(day(6)), steps: 100 },
        ],
      },
    });

    expect(await screen.findByText('On days with 8,000+ steps your mood is 40% better.')).toBeOnTheScreen();
  });
});
