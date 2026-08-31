/**
 * Werk- und Tafelfotos sind in dieser Vorschau Platzhalter (gestreiftes Muster
 * in werk-spezifischer Hue) — s. Handoff README → "Assets". In der Produktiv-
 * version ersetzen die vom Nutzer aufgenommenen/importierten Fotos dies 1:1
 * (gleiches Seitenverhältnis, gleiche Rundung).
 */
const PLACEHOLDER_HUES = [50, 30, 65, 15, 80, 40, 55, 25, 70, 10];

export function placeholderBg(seed: number): string {
  const h = PLACEHOLDER_HUES[((seed % PLACEHOLDER_HUES.length) + PLACEHOLDER_HUES.length) % PLACEHOLDER_HUES.length];
  return `repeating-linear-gradient(135deg, oklch(0.27 0.03 ${h}) 0 9px, oklch(0.22 0.025 ${h}) 9px 18px)`;
}
