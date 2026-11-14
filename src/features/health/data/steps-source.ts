/**
 * Port für Schrittdaten (Adapter-Pattern). Die App fragt nur dieses Interface –
 * woher die Schritte kommen, entscheidet der gewählte Adapter:
 *
 * - `manual`:         Eingabe von Hand (Web, heute der einzige Adapter)
 * - `healthkit`:      Apple HealthKit (iOS, Phase 2)
 * - `health-connect`: Health Connect (Android, Phase 2)
 */
export type StepsSourceKind = 'manual' | 'healthkit' | 'health-connect';

export interface StepsSource {
  readonly kind: StepsSourceKind;
  /** `true`, wenn der Nutzer die Schritte selbst eintippen muss. */
  readonly requiresManualEntry: boolean;
  /** Schritte eines Tages aus der Quelle, oder `null`, wenn sie keine liefert. */
  readSteps(day: string): Promise<number | null>;
}

/** Im Web gibt es keinen Zugriff auf Schrittdaten – der Nutzer erfasst sie selbst. */
export const manualStepsSource: StepsSource = {
  kind: 'manual',
  requiresManualEntry: true,
  readSteps: async () => null,
};
