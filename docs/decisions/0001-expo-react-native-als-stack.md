# ADR 0001: Expo (React Native) + TypeScript als Stack

- Status: akzeptiert
- Datum: 2026-11-14

## Kontext

Die App startet als Web-App und soll später in den App Store und Play Store.
Eine einzige Codebasis soll Web, iOS und Android abdecken. Auf den nativen Plattformen
brauchen wir Zugriff auf HealthKit (iOS) und Health Connect (Android).

## Entscheid

Expo SDK 58 mit React Native 0.88, Expo Router (dateibasiertes Routing) und TypeScript (strict).

## Begründung

- **Eine Codebasis für alle drei Plattformen:** React Native rendert native Komponenten,
  im Web übernimmt react-native-web. Expo Router liefert dasselbe Routing überall.
- **Native APIs erreichbar:** Über Development Builds und Config Plugins lassen sich
  HealthKit und Health Connect einbinden, ohne das Expo-Ökosystem zu verlassen.
- **Store-Auslieferung ohne eigenen Mac-Build:** EAS Build/Submit baut und signiert in der Cloud.
- **TypeScript/React** passen zur Ausbildung und haben das grösste Ökosystem.

## Alternativen

- **Flutter:** sehr gutes natives Ergebnis, aber Dart statt TypeScript und im Web schwächer
  (Canvas-Rendering, schlechtere Barrierefreiheit und SEO).
- **Web-App + Capacitor:** einfachster Weg vom Web aus, aber die App bleibt eine WebView –
  weniger natives Gefühl, Widgets und Health-Anbindung sind umständlicher.
- **Next.js fürs Web + separate React-Native-App:** zwei Codebasen, doppelte Arbeit.

## Konsequenzen

- Web-Bundle ist grösser als bei einer reinen Web-App.
- Expo veröffentlicht mehrmals pro Jahr neue SDKs mit Breaking Changes → API-Fragen immer
  in der versionierten Doku nachschlagen (siehe `AGENTS.md`).
- Health-Daten brauchen später einen Development Build (Expo Go reicht dafür nicht).
