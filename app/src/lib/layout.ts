/**
 * ios-frame.jsx (Vorschau-Bezel aus dem Design-Handoff) ist keine
 * Produktionskomponente und rendert hier nicht mit — die im Design
 * hartkodierten Top-Abstände (56/59px) glichen dort die simulierte iOS-
 * Statusleiste aus. In der echten PWA übernimmt stattdessen die Safe Area
 * des Geräts (Dynamic Island / Notch) diesen Ausgleich.
 */
export const SCREEN_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 16px)';
