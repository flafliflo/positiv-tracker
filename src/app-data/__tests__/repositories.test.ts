import { createCheck } from '@/features/habits/domain/habit';
import { emptyHealthDay } from '@/features/health/domain/health-day';

import { createInMemoryRepositories, deleteAllData, exportAppData, loadAppData } from '../repositories';

const seed = {
  wins: [{ id: 'w', text: 'Win', category: 'other', day: '2026-11-15', createdAt: '2026-11-15T10:00:00.000Z' } as const],
  journal: [{ id: 'j', text: 'Text', mood: 4, day: '2026-11-15', createdAt: '2026-11-15T11:00:00.000Z' } as const],
  habits: [{ id: 'h', name: 'Lesen', day: '2026-11-01', createdAt: '2026-11-01T08:00:00.000Z' }],
  habitChecks: [createCheck('h', '2026-11-15')],
  health: [{ ...emptyHealthDay('2026-11-15'), steps: 8000 }],
};

describe('repositories', () => {
  it('loads all collections into one AppData object', async () => {
    const repositories = createInMemoryRepositories(seed);

    expect(await loadAppData(repositories)).toEqual(seed);
  });

  it('starts empty without seed data', async () => {
    expect(await loadAppData(createInMemoryRepositories())).toEqual({
      wins: [],
      journal: [],
      habits: [],
      habitChecks: [],
      health: [],
    });
  });

  it('exports everything as one portable document', async () => {
    const repositories = createInMemoryRepositories(seed);
    const exportedAt = new Date('2026-11-15T12:00:00.000Z');

    expect(await exportAppData(repositories, exportedAt)).toEqual({
      app: 'positiv-tracker',
      formatVersion: 1,
      exportedAt: '2026-11-15T12:00:00.000Z',
      data: seed,
    });
  });

  it('deletes all data', async () => {
    const repositories = createInMemoryRepositories(seed);

    await deleteAllData(repositories);

    expect(await loadAppData(repositories)).toEqual({ wins: [], journal: [], habits: [], habitChecks: [], health: [] });
  });
});
