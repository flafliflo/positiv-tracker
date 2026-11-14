# Feature-Ideen und Konkurrenz-Recherche

Stand: 2026-11-14. Kurzrecherche (Websuche + Vorwissen), keine vollständige Marktanalyse.
Die Nutzerstimmen stammen aus Foren und Review-Auswertungen und sind als Tendenz zu lesen.

## Was Nutzer an bestehenden Apps stört

| App | Stärke | Häufige Kritik |
| --- | --- | --- |
| Day One | Schönes Journal, Fotos, Ende-zu-Ende-Verschlüsselung | Abo sperrt Kernfunktionen, aggressive Upsells, Sorge um Sync/Datenverlust, schwache Windows/Android-Version |
| Daylio | Eintrag in Sekunden per Icons, gute Statistiken | iOS und Android unterschiedlich weit, wenig Platz für freien Text |
| Reflectly | Geführtes, „warmes" Journaling | Unerwartete Abbuchungen, Support reagiert nicht, Premium-Probleme |
| Streaks / Habitica | Starke Motivation über Serien bzw. Gamification | Streak-Verlust demotiviert; Habitica wirkt verspielt und überladen |
| Apple Health | Zentrale Gesundheitsdaten | Keine Verbindung zu Stimmung/Tagebuch, nur Apple |

Wiederkehrende Themen: Paywalls auf Grundfunktionen, Angst vor Datenverlust, mühsamer Export,
nervige Benachrichtigungen, ungleiche Plattformen.

Quellen: [Day-One-Forum: Feedback zur Zukunft](https://forums.dayoneapp.com/forums/topic/urgent-feedback-and-concerns-about-day-ones-app-future/),
[Day-One-Forum: Upsell-Kritik](https://forums.dayoneapp.com/forums/topic/disgraceful-upsell-upgrade-to-day-one-gold-looking-for-alternatives/),
[Daylio-Hilfe: fehlende Features je Plattform](https://daylio.helpscoutdocs.com/article/50-missing-features-on-ios),
[Kimola: Reflectly-Review-Analyse](https://kimola.com/reports/reflectly-app-feedback-analysis-insights-recommendations-app-store-us-144965),
[Unstar: Journaling-Apps im Vergleich 2026](https://unstar.app/blog/day-one-journey-reflectly-stoic-finch-journaling-apps-ranked-2026).

## MVP (zwingend für Version 1)

- [x] Win erfassen und anzeigen (Text, Kategorie, Datum) – in DE/IT/EN
- [x] Win bearbeiten und löschen
- [x] Gedanken: freier Journal-Eintrag mit Stimmung 1–5
- [x] Gewohnheiten: eigene Habits anlegen und täglich abhaken
- [x] Gesundheit manuell erfassen: Schritte, Schlaf, Wasser, Training
- [x] Heute-Ansicht: alles für den aktuellen Tag auf einem Bildschirm, Eintrag in unter 10 Sekunden
- [x] Streaks und Kalender-Heatmap
- [x] Wochen- und Monatsrückblick mit einfachen Statistiken
- [ ] Konto mit sicherem Login und Sync (Datentrennung pro Nutzer)
- [x] Export aller Daten (JSON) und Löschen aller Daten (lokal; Konto-Löschung folgt mit dem Login)
- [x] Einstellungen: Sprache, Dark Mode

## Später (nice to have)

- Schritte automatisch aus HealthKit (iOS) und Health Connect (Android)
- Tägliche Erinnerung zur Wunschzeit (dezent, leicht abschaltbar)
- [x] Dankbarkeits- und Reflexions-Prompts (Impuls des Tages)
- Fotos und Sprachnotizen an Einträgen
- Suche, Tags, Filter nach Kategorie
- Home-Screen-Widgets (Streak, Schnell-Eintrag)
- App-Sperre mit Face ID / Fingerabdruck
- „An diesem Tag vor einem Jahr"
- Ziele (z. B. 8'000 Schritte/Tag) mit Fortschrittsring
- Offline-Modus mit späterem Sync

## Unterscheidungsmerkmale

1. **Wins zuerst statt nur Stimmung:** Der Fokus liegt auf dem, was gelungen ist –
   ein „Erfolgs-Archiv", das man an schlechten Tagen durchblättern kann.
2. **Zusammenhänge sichtbar machen:** „An Tagen mit 10'000+ Schritten ist deine Stimmung
   20 % besser." Stimmung, Schlaf, Schritte und Habits in einer App verknüpft –
   das trennen die bestehenden Apps.
3. **KI-Wochenrückblick:** persönliche Zusammenfassung der Woche mit Mustern und einem
   Vorschlag für die nächste Woche (opt-in, mit klarer Angabe, was verarbeitet wird).
4. **Privatsphäre als Versprechen:** lokal nutzbar ohne Konto, Verschlüsselung sensibler
   Felder, Export in einem Klick, keine Werbung, kein Tracking.
5. **Fair statt Paywall:** Erfassen, Ansehen und Exportieren bleiben gratis;
   bezahlt werden höchstens Zusatzfunktionen (KI-Rückblick, Sync).
6. **Schonende Streaks:** „Joker-Tage" statt hartem Reset, damit ein verpasster Tag nicht demotiviert.
7. **Überall gleich:** dieselbe App im Web, auf iOS und Android aus einer Codebasis.
8. **Dreisprachig ab Tag 1** (DE/IT/EN) – passend für die Schweiz.
