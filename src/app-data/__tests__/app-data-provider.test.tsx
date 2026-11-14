import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { createCheck } from '@/features/habits/domain/habit';

import { AppDataProvider, useAppData } from '../app-data-provider';
import { createInMemoryRepositories, loadAppData, type Repositories } from '../repositories';

const now = () => new Date(2026, 10, 15, 9, 0);

async function setup(repositories: Repositories = createInMemoryRepositories()) {
  let nextId = 1;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider repositories={repositories} now={now} generateId={() => `id-${nextId++}`}>
      {children}
    </AppDataProvider>
  );
  const hook = await renderHook(() => useAppData(), { wrapper });
  await waitFor(() => expect(hook.result.current.status).toBe('ready'));
  return { ...hook, repositories };
}

describe('AppDataProvider', () => {
  it('loads stored data and knows today', async () => {
    const repositories = createInMemoryRepositories({
      wins: [{ id: 'w', text: 'Win', category: 'other', day: '2026-11-14', createdAt: '2026-11-14T10:00:00.000Z' }],
    });
    const { result } = await setup(repositories);

    expect(result.current.today).toBe('2026-11-15');
    expect(result.current.data.wins).toHaveLength(1);
  });

  it('reports an error when loading fails', async () => {
    const repositories = createInMemoryRepositories();
    repositories.wins.list = async () => {
      throw new Error('storage unavailable');
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppDataProvider repositories={repositories} now={now} generateId={() => 'id'}>
        {children}
      </AppDataProvider>
    );
    const { result } = await renderHook(() => useAppData(), { wrapper });

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  describe('wins', () => {
    it('adds, edits and removes a win and keeps storage in sync', async () => {
      const { result, repositories } = await setup();

      await act(async () => {
        expect(await result.current.actions.addWin({ text: ' Gelaufen ', category: 'health' })).toEqual({ ok: true });
      });
      expect(result.current.data.wins).toEqual([
        { id: 'id-1', text: 'Gelaufen', category: 'health', day: '2026-11-15', createdAt: now().toISOString() },
      ]);

      await act(async () => {
        await result.current.actions.updateWin('id-1', { text: 'Gejoggt', category: 'health' });
      });
      expect(result.current.data.wins[0].text).toBe('Gejoggt');
      expect((await repositories.wins.list())[0].text).toBe('Gejoggt');

      await act(async () => {
        await result.current.actions.removeWin('id-1');
      });
      expect(result.current.data.wins).toEqual([]);
      expect(await repositories.wins.list()).toEqual([]);
    });

    it('returns the validation error and stores nothing', async () => {
      const { result, repositories } = await setup();

      await act(async () => {
        expect(await result.current.actions.addWin({ text: '  ', category: 'other' })).toEqual({
          ok: false,
          error: 'textRequired',
        });
      });
      expect(await repositories.wins.list()).toEqual([]);
    });

    it('returns saveFailed when storage throws', async () => {
      const repositories = createInMemoryRepositories();
      repositories.wins.upsert = async () => {
        throw new Error('quota exceeded');
      };
      const { result } = await setup(repositories);

      await act(async () => {
        expect(await result.current.actions.addWin({ text: 'x', category: 'other' })).toEqual({
          ok: false,
          error: 'saveFailed',
        });
      });
      expect(result.current.data.wins).toEqual([]);
    });
  });

  it('adds, edits and removes a journal entry', async () => {
    const { result } = await setup();

    await act(async () => {
      expect(await result.current.actions.addJournalEntry({ text: 'Müde', mood: null })).toEqual({
        ok: false,
        error: 'moodRequired',
      });
      await result.current.actions.addJournalEntry({ text: 'Müde', mood: 2 });
    });
    expect(result.current.data.journal).toMatchObject([{ id: 'id-1', text: 'Müde', mood: 2 }]);

    await act(async () => {
      await result.current.actions.updateJournalEntry('id-1', { text: 'Besser', mood: 4 });
    });
    expect(result.current.data.journal).toMatchObject([{ id: 'id-1', text: 'Besser', mood: 4 }]);

    await act(async () => {
      await result.current.actions.removeJournalEntry('id-1');
    });
    expect(result.current.data.journal).toEqual([]);
  });

  it('adds a habit, toggles it for a day and removes it together with its checks', async () => {
    const { result, repositories } = await setup();

    await act(async () => {
      await result.current.actions.addHabit('Meditieren');
    });
    expect(result.current.data.habits).toMatchObject([{ id: 'id-1', name: 'Meditieren' }]);

    await act(async () => {
      await result.current.actions.toggleHabit('id-1', '2026-11-15');
    });
    expect(result.current.data.habitChecks).toEqual([createCheck('id-1', '2026-11-15')]);

    await act(async () => {
      await result.current.actions.toggleHabit('id-1', '2026-11-15');
    });
    expect(result.current.data.habitChecks).toEqual([]);

    await act(async () => {
      await result.current.actions.toggleHabit('id-1', '2026-11-15');
      await result.current.actions.removeHabit('id-1');
    });
    expect(await loadAppData(repositories)).toMatchObject({ habits: [], habitChecks: [] });
    expect(result.current.data.habits).toEqual([]);
    expect(result.current.data.habitChecks).toEqual([]);
  });

  it('stores health metrics per day', async () => {
    const { result, repositories } = await setup();

    await act(async () => {
      await result.current.actions.setHealthMetric('2026-11-15', 'steps', 8421);
      await result.current.actions.setHealthMetric('2026-11-15', 'waterGlasses', 3);
    });

    expect(result.current.data.health).toMatchObject([{ day: '2026-11-15', steps: 8421, waterGlasses: 3 }]);
    expect(await repositories.health.list()).toMatchObject([{ day: '2026-11-15', steps: 8421, waterGlasses: 3 }]);
  });

  it('exports and deletes all data', async () => {
    const { result, repositories } = await setup();
    await act(async () => {
      await result.current.actions.addWin({ text: 'Win', category: 'other' });
    });

    const exported = await result.current.actions.exportData();
    expect(exported.data.wins).toHaveLength(1);

    await act(async () => {
      await result.current.actions.deleteAllData();
    });
    expect(result.current.data.wins).toEqual([]);
    expect(await repositories.wins.list()).toEqual([]);
  });
});
