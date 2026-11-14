import { createJournalEntry, editJournalEntry, MAX_JOURNAL_TEXT_LENGTH, MOODS } from '../journal-entry';

const now = new Date(2026, 10, 15, 8, 0);
const deps = { now: () => now, generateId: () => 'entry-1' };

describe('createJournalEntry', () => {
  it('creates an entry with mood, trimmed text, day and timestamp', () => {
    expect(createJournalEntry({ text: '  Guter Tag  ', mood: 4 }, deps)).toEqual({
      ok: true,
      entry: { id: 'entry-1', text: 'Guter Tag', mood: 4, day: '2026-11-15', createdAt: now.toISOString() },
    });
  });

  it('allows a mood without any text (quick check-in)', () => {
    const result = createJournalEntry({ text: '', mood: 2 }, deps);
    expect(result.ok && result.entry.text).toBe('');
  });

  it('requires a mood', () => {
    expect(createJournalEntry({ text: 'Hallo', mood: null }, deps)).toEqual({ ok: false, error: 'moodRequired' });
  });

  it('rejects a text that is too long', () => {
    const text = 'a'.repeat(MAX_JOURNAL_TEXT_LENGTH + 1);
    expect(createJournalEntry({ text, mood: 3 }, deps)).toEqual({ ok: false, error: 'textTooLong' });
  });

  it('offers moods 1 to 5', () => {
    expect(MOODS).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('editJournalEntry', () => {
  const entry = { id: 'e', text: 'Alt', mood: 2, day: '2026-11-10', createdAt: '2026-11-10T08:00:00.000Z' } as const;

  it('changes text and mood but keeps id, day and timestamp', () => {
    expect(editJournalEntry(entry, { text: ' Neu ', mood: 5 })).toEqual({
      ok: true,
      entry: { ...entry, text: 'Neu', mood: 5 },
    });
  });

  it('validates like a new entry', () => {
    expect(editJournalEntry(entry, { text: 'x', mood: null })).toEqual({ ok: false, error: 'moodRequired' });
  });
});
