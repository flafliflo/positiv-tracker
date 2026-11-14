import { editWin, MAX_WIN_TEXT_LENGTH, type Win } from '../win';

const win: Win = { id: 'w', text: 'Alt', category: 'work', day: '2026-11-10', createdAt: '2026-11-10T08:00:00.000Z' };

describe('editWin', () => {
  it('changes text and category but keeps id, day and timestamp', () => {
    expect(editWin(win, { text: '  Neu  ', category: 'health' })).toEqual({
      ok: true,
      win: { ...win, text: 'Neu', category: 'health' },
    });
  });

  it('validates like a new win', () => {
    expect(editWin(win, { text: ' ', category: 'work' })).toEqual({ ok: false, error: 'textRequired' });
    expect(editWin(win, { text: 'a'.repeat(MAX_WIN_TEXT_LENGTH + 1), category: 'work' })).toEqual({
      ok: false,
      error: 'textTooLong',
    });
  });
});
