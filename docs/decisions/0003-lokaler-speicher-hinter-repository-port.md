# ADR 0003: Daten vorerst lokal, hinter einem Repository-Port

- Status: akzeptiert (Backend-Wahl offen)
- Datum: 2026-11-14

## Kontext

Tagebuch-Daten sind sehr privat. Für das SaaS braucht es später Login, Synchronisation,
strikte Datentrennung pro Nutzer, Export und Kontolöschung (DSG/DSGVO). Die Wahl von
Datenbank und Auth-Anbieter ist ein grosser Entscheid (inkl. möglicher Kosten) und noch
nicht getroffen. Die erste Version sollte trotzdem sofort live gehen.

## Entscheid

- Die UI spricht nur mit dem Interface `WinRepository` (Port).
- Erster Adapter: `AsyncStorageWinRepository` – speichert auf dem Gerät
  (im Web: localStorage). Es verlassen keine Daten das Gerät.
- Ein Vertragstest stellt sicher, dass sich alle Adapter gleich verhalten.

## Begründung

- Sofort nutzbar, keine Kosten, kein Konto nötig, maximal privat.
- Der spätere Wechsel auf ein Backend ändert nur den Adapter im Composition Root.
- Dasselbe Muster gilt später für Schrittdaten: HealthKit, Health Connect und manuelle
  Eingabe als austauschbare Adapter eines Ports.

## Konsequenzen und Grenzen

- Kein Geräte-Sync, kein Backup: Wer Browserdaten löscht, verliert die Einträge.
- localStorage ist unverschlüsselt und für jeden mit Zugriff auf das Gerät/den Browser lesbar.
- Öffentlich gehostete Seite ohne Login: Jede Person sieht nur ihre eigenen, lokalen Daten.

## Offene Entscheide (mit Flavio)

1. Backend: z. B. Supabase (Postgres + Row Level Security + Auth, EU-Region) oder Alternativen.
2. Verschlüsselung sensibler Felder (client-seitig, Ende-zu-Ende) – Auswirkungen auf Suche und KI-Funktionen.
3. Export (JSON/CSV) und Kontolöschung.
