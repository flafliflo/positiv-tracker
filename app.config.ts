import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Ergänzt app.json um Werte, die von der Umgebung abhängen.
 * EXPO_BASE_URL: Unterpfad für das Web-Hosting, z. B. "/positiv-tracker" auf
 * GitHub Pages (https://<user>.github.io/positiv-tracker/). Lokal bleibt er leer.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseUrl = process.env.EXPO_BASE_URL;

  return {
    ...config,
    name: config.name ?? 'Positiv-Tracker',
    slug: config.slug ?? 'positiv-tracker',
    experiments: {
      ...config.experiments,
      ...(baseUrl ? { baseUrl } : {}),
    },
  };
};
