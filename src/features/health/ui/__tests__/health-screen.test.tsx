import { screen, userEvent, within } from '@testing-library/react-native';

import { createCheck } from '@/features/habits/domain/habit';
import { renderWithProviders, TEST_TODAY } from '@/test-utils/render-with-providers';

import { manualStepsSource } from '../../data/steps-source';
import { emptyHealthDay } from '../../domain/health-day';
import { HealthScreen } from '../health-screen';

describe('HealthScreen', () => {
  it.each([
    ['de', 'Gesundheit', ['Schritte', 'Schlaf', 'Wasser', 'Training'], 'Gewohnheiten'],
    ['it', 'Salute', ['Passi', 'Sonno', 'Acqua', 'Allenamento'], 'Abitudini'],
    ['en', 'Health', ['Steps', 'Sleep', 'Water', 'Training'], 'Habits'],
  ] as const)('%s: shows the four metrics and the habits section', async (language, title, metrics, habits) => {
    await renderWithProviders(<HealthScreen />, { language });

    expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
    metrics.forEach((metric, index) => {
      expect(screen.getByTestId(`metric-${index}`)).toHaveTextContent(new RegExp(metric));
    });
    expect(screen.getByRole('heading', { name: habits })).toBeOnTheScreen();
  });

  describe('steps (manual entry on the web)', () => {
    it('the manual source never delivers steps itself', async () => {
      expect(manualStepsSource.requiresManualEntry).toBe(true);
      expect(await manualStepsSource.readSteps(TEST_TODAY)).toBeNull();
    });

    it('saves typed steps and shows them formatted', async () => {
      const user = userEvent.setup();
      const { repositories } = await renderWithProviders(<HealthScreen />);

      await user.type(await screen.findByLabelText('Steps'), "8'421");
      await user.press(screen.getByRole('button', { name: 'Save steps' }));

      expect(await screen.findByText('8,421')).toBeOnTheScreen();
      expect(await repositories.health.list()).toMatchObject([{ day: TEST_TODAY, steps: 8421 }]);
    });

    it('rejects input that is not a number', async () => {
      const user = userEvent.setup();
      const { repositories } = await renderWithProviders(<HealthScreen />);

      await user.type(await screen.findByLabelText('Steps'), 'many');
      await user.press(screen.getByRole('button', { name: 'Save steps' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a number, e.g. 8000.');
      expect(await repositories.health.list()).toEqual([]);
    });
  });

  it('counts water glasses up and down', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<HealthScreen />);

    await user.press(await screen.findByRole('button', { name: 'Increase Water' }));
    await user.press(screen.getByRole('button', { name: 'Increase Water' }));
    await user.press(screen.getByRole('button', { name: 'Decrease Water' }));

    expect(within(screen.getByTestId('metric-2')).getByText('1')).toBeOnTheScreen();
    expect(await repositories.health.list()).toMatchObject([{ waterGlasses: 1 }]);
  });

  it('adjusts sleep in half hours and training in 5 minutes', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<HealthScreen />, {
      seed: { health: [{ ...emptyHealthDay(TEST_TODAY), sleepHours: 7, trainingMinutes: 15 }] },
    });

    await user.press(await screen.findByRole('button', { name: 'Increase Sleep' }));
    await user.press(screen.getByRole('button', { name: 'Increase Training' }));

    expect(within(screen.getByTestId('metric-1')).getByText('7.5')).toBeOnTheScreen();
    expect(within(screen.getByTestId('metric-3')).getByText('20')).toBeOnTheScreen();
    expect(await repositories.health.list()).toMatchObject([{ sleepHours: 7.5, trainingMinutes: 20 }]);
  });

  describe('habits', () => {
    it('adds a habit and ticks it off for today', async () => {
      const user = userEvent.setup();
      const { repositories } = await renderWithProviders(<HealthScreen />);

      expect(await screen.findByText('No habits yet')).toBeOnTheScreen();
      await user.type(screen.getByLabelText('New habit'), 'Read');
      await user.press(screen.getByRole('button', { name: 'Add' }));

      const checkbox = await screen.findByRole('checkbox', { name: 'Read done' });
      expect(checkbox).not.toBeChecked();
      expect(screen.getByLabelText('New habit')).toHaveDisplayValue('');

      await user.press(checkbox);

      expect(screen.getByRole('checkbox', { name: 'Read done' })).toBeChecked();
      expect(await repositories.habitChecks.list()).toEqual([createCheck('id-1', TEST_TODAY)]);
    });

    it('shows the streak of a habit', async () => {
      await renderWithProviders(<HealthScreen />, {
        seed: {
          habits: [{ id: 'h', name: 'Read', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' }],
          habitChecks: [createCheck('h', '2026-11-13'), createCheck('h', '2026-11-14'), createCheck('h', TEST_TODAY)],
        },
      });

      expect(await screen.findByLabelText('Streak of Read: 3 days')).toBeOnTheScreen();
    });

    it('validates the habit name', async () => {
      const user = userEvent.setup();
      await renderWithProviders(<HealthScreen />);

      await user.press(await screen.findByRole('button', { name: 'Add' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Give the habit a name.');
    });

    it('deletes a habit after confirmation', async () => {
      const user = userEvent.setup();
      const { repositories } = await renderWithProviders(<HealthScreen />, {
        seed: { habits: [{ id: 'h', name: 'Read', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' }] },
      });

      await user.press(await screen.findByRole('button', { name: 'Delete Read' }));
      await user.press(screen.getByRole('button', { name: 'Delete' }));

      expect(await screen.findByText('No habits yet')).toBeOnTheScreen();
      expect(await repositories.habits.list()).toEqual([]);
    });
  });
});
