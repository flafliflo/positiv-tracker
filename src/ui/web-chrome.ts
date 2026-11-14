import { darkPalette, lightPalette } from './palette';

/**
 * Stellen, die der Browser selbst zeichnet (Textauswahl, Schreibmarke, Scrollbalken,
 * native Formular-Elemente), bekommen die Farben der App statt der Browser-Standards.
 * Ziffern sind überall gleich breit, damit Zahlen in Listen sauber untereinander stehen.
 */
export function applyWebChrome(doc: Document): void {
  const css = (palette: Record<keyof typeof lightPalette, string>) => `
    :root { accent-color: ${palette.brand}; }
    ::selection { background: ${palette.brandSoft}; color: ${palette.ink}; }
    input, textarea { caret-color: ${palette.brand}; }
    * { scrollbar-width: thin; scrollbar-color: ${palette.line} transparent; }
  `;

  const style = doc.createElement('style');
  style.textContent = `
    :root { color-scheme: light dark; }
    body { font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }
    a { text-decoration: none; }
    ${css(lightPalette)}
    @media (prefers-color-scheme: dark) { ${css(darkPalette)} }
  `;
  doc.head.appendChild(style);
}
