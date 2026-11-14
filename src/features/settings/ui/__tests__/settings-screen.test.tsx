import { screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render-with-providers';

import { buildExportFile } from '../../data/export-file';
import { SettingsScreen } from '../settings-screen';

const seed = {
  wins: [{ id: 'w', text: 'Win', category: 'other', day: '2026-11-15', createdAt: '2026-11-15T07:00:00.000Z' } as const],
};

describe('buildExportFile', () => {
  it('names the file after the export day and contains readable JSON', () => {
    const file = buildExportFile({
      app: 'positiv-tracker',
      formatVersion: 1,
      exportedAt: '2026-11-15T08:00:00.000Z',
      data: { wins: [...seed.wins], journal: [], habits: [], habitChecks: [], health: [] },
    });

    expect(file.filename).toBe('positiv-tracker-2026-11-15.json');
    expect(JSON.parse(file.content).data.wins[0].text).toBe('Win');
    expect(file.content).toContain('\n'); // eingerückt, damit Menschen es lesen können
  });
});

describe('SettingsScreen', () => {
  it.each([
    ['de', 'Einstellungen', 'Sprache', 'Daten exportieren (JSON)', 'Alle Daten löschen'],
    ['it', 'Impostazioni', 'Lingua', 'Esporta dati (JSON)', 'Elimina tutti i dati'],
    ['en', 'Settings', 'Language', 'Export data (JSON)', 'Delete all data'],
  ] as const)('%s: offers language, export and deletion', async (language, title, languageLabel, exportLabel, deleteLabel) => {
    await renderWithProviders(<SettingsScreen onBack={() => {}} saveFile={async () => {}} />, { language });

    expect(await screen.findByRole('heading', { name: title })).toBeOnTheScreen();
    expect(screen.getByLabelText(languageLabel)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: exportLabel })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: deleteLabel })).toBeOnTheScreen();
  });

  it('exports all data as a JSON file', async () => {
    const user = userEvent.setup();
    const saveFile = jest.fn(async () => {});
    await renderWithProviders(<SettingsScreen onBack={() => {}} saveFile={saveFile} />, { seed });

    await user.press(await screen.findByRole('button', { name: 'Export data (JSON)' }));

    expect(await screen.findByText('Export created.')).toBeOnTheScreen();
    expect(saveFile).toHaveBeenCalledTimes(1);
    const file = (saveFile.mock.calls[0] as unknown as [{ filename: string; content: string }])[0];
    expect(file.filename).toBe('positiv-tracker-2026-11-15.json');
    expect(JSON.parse(file.content).data.wins).toHaveLength(1);
  });

  it('deletes all data only after confirmation', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<SettingsScreen onBack={() => {}} saveFile={async () => {}} />, { seed });

    await user.press(await screen.findByRole('button', { name: 'Delete all data' }));
    expect(screen.getByText(/Really delete all data\?/)).toBeOnTheScreen();
    expect(await repositories.wins.list()).toHaveLength(1);

    await user.press(screen.getByRole('button', { name: 'Yes, delete everything' }));

    expect(await screen.findByText('All data has been deleted.')).toBeOnTheScreen();
    expect(await repositories.wins.list()).toEqual([]);
  });

  it('can cancel the deletion', async () => {
    const user = userEvent.setup();
    const { repositories } = await renderWithProviders(<SettingsScreen onBack={() => {}} saveFile={async () => {}} />, { seed });

    await user.press(await screen.findByRole('button', { name: 'Delete all data' }));
    await user.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText(/Really delete all data\?/)).not.toBeOnTheScreen();
    expect(await repositories.wins.list()).toHaveLength(1);
  });

  it('goes back', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    await renderWithProviders(<SettingsScreen onBack={onBack} saveFile={async () => {}} />);

    await user.press(await screen.findByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
