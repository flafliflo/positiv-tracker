/**
 * Erzeugt eine eindeutige ID. Nutzt die Web-Crypto-API, wo vorhanden (Browser,
 * neuere React-Native-Versionen), sonst Zeitstempel + Zufall als Rückfall.
 */
export function generateWinId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
