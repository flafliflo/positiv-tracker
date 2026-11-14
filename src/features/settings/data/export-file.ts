import { Platform, Share } from 'react-native';

import type { ExportDocument } from '@/app-data/repositories';

export type ExportFile = { filename: string; content: string };

/** Macht aus dem Export-Dokument eine lesbare JSON-Datei mit Datum im Namen. */
export function buildExportFile(document: ExportDocument): ExportFile {
  return {
    filename: `positiv-tracker-${document.exportedAt.slice(0, 10)}.json`,
    content: JSON.stringify(document, null, 2),
  };
}

/**
 * Übergibt die Datei dem Nutzer: im Web als Download, nativ über den Teilen-Dialog.
 * (Plattform-Code – wird in Tests durch eine Attrappe ersetzt.)
 */
export async function saveExportFile(file: ExportFile): Promise<void> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([file.content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: file.filename, message: file.content });
}
