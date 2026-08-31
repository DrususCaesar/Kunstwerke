import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

/**
 * Server-seitige Claude-Vision-Erkennung — Konzept Abschnitt 4.1, 4.2, 7.
 * Läuft als Vercel Serverless Function, damit der ANTHROPIC_API_KEY (als
 * Vercel-Umgebungsvariable gesetzt) niemals im Client landet. Ohne Key
 * antwortet die Function mit 503 — der Client fällt dann auf die bisherige
 * ehrliche Leer-Antwort zurück (src/services/recognition.ts).
 */

export const config = { maxDuration: 45 };

const RecognitionSchema = z.object({
  title: z.string().describe('Deutscher kunsthistorischer Titel, sonst Originaltitel. Leer, wenn unbekannt.'),
  artistFull: z.string().describe('Vollständiger Künstlername, deutsche kanonische Form. Leer bei Notnamen oder wenn unbekannt.'),
  artistCall: z.string().describe('Kunsthistorisch gebräuchlicher Rufname bzw. Notname. "Unbekannt", wenn nicht bestimmbar.'),
  isNotname: z.boolean().describe('true bei Notnamen (z. B. "Meister von Flémalle") oder wenn kein Künstler bestimmbar ist.'),
  year: z.string().describe('Jahr oder Circa-Angabe, z. B. "um 1620". Leer, wenn unbekannt.'),
  epoch: z.string().describe('Kunsthistorische Epoche, z. B. Barock, Frührenaissance. Leer, wenn unklar.'),
  genre: z.string().describe('Gattung: Gemälde, Skulptur, Zeichnung, Fresko, Grafik o. ä. Leer, wenn unklar.'),
  museum: z.string().describe('Name der Institution, aus der Tafel gelesen. Leer, wenn nicht erkennbar.'),
  room: z.string().describe('Saal/Raum-Nummer, falls auf der Tafel vermerkt. Sonst leer.'),
  city: z.string().describe('Stadt/Land des Museums, falls erkennbar. Sonst leer.'),
  material: z.string().describe('Material/Technik, z. B. "Öl auf Leinwand". Leer, wenn unbekannt.'),
  tags: z.array(z.string()).describe('Ein bis vier passende Schlagworte, z. B. "Porträt", "Stillleben".'),
  notes: z.string().describe('Kurzer sachlicher Hinweis, falls für die Erfassung relevant (z. B. Unsicherheiten). Sonst leer.'),
  confidence: z
    .enum(['sicher', 'Vorschlag, bitte prüfen'])
    .describe('"sicher" NUR wenn Titel und Künstler eindeutig aus lesbarem Tafeltext stammen. Sonst immer "Vorschlag, bitte prüfen".'),
  crop: z
    .object({
      xMinPct: z.number().describe('Linker Rand des Werks/Rahmens in % der Bildbreite (0-100)'),
      yMinPct: z.number().describe('Oberer Rand in % der Bildhöhe (0-100)'),
      xMaxPct: z.number().describe('Rechter Rand in % der Bildbreite (0-100)'),
      yMaxPct: z.number().describe('Unterer Rand in % der Bildhöhe (0-100)'),
    })
    .nullable()
    .describe('Achsenparalleler Zuschnitt-Vorschlag für das Werkfoto, der Wand/Umgebung entfernt. null, wenn die Grenzen nicht klar erkennbar sind (z. B. Werk füllt bereits das ganze Foto, oder zu unklar/schräg für einen sicheren Vorschlag).'),
});

const SYSTEM_PROMPT = `Du hilfst, ein privates Foto aus einem Museumsbesuch für eine Kunstwerk-Sammlung zu katalogisieren.

Regeln (verbindlich):
- Deutsche kunsthistorische Standardnamen verwenden, nicht die wörtliche Übersetzung oder blind die Sprache der Tafel: "Raffael" (nicht Raffaello/Raphael), "Tizian" (nicht Tiziano), "Leonardo da Vinci" bleibt. Werktitel: etablierter deutscher Titel, sonst Originaltitel.
- Notnamen (z. B. "Meister von Flémalle", "Meister des Bartholomäus-Altars") korrekt als Rufname erkennen, artistFull dabei leer lassen, isNotname=true. Keinen vollständigen Namen erfinden.
- artistFull und artistCall getrennt befüllen, nicht als eine Zeichenkette.
- Ist ein Tafel-/Beschriftungsfoto vorhanden: Text sorgfältig lesen (auch bei Schrägaufnahme oder Teilverdeckung) und daraus Künstler/Titel/Jahr/Material/Museum extrahieren.
- Ist nur das Werkfoto vorhanden: Erkennungsversuch anhand Stil/bekannter Komposition, aber nur wenn du wirklich zuversichtlich bist.
- confidence ehrlich vergeben: "sicher" ausschließlich bei eindeutig lesbarem Tafeltext. Bei jeder Unsicherheit "Vorschlag, bitte prüfen".
- Nichts erfinden: Kannst du ein Feld nicht bestimmen, lasse es als leeren String (bzw. "Unbekannt" für artistCall, true für isNotname) statt zu raten.
- crop: nur vorschlagen, wenn Rahmen/Werkgrenzen im Werkfoto klar erkennbar sind und sich ein Zuschnitt lohnt (sichtbare Wand/Umgebung um das Werk). Sonst null.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const primaryImage = req.body?.primaryImage;
  const tafelImage = req.body?.tafelImage;
  if (typeof primaryImage !== 'string') {
    res.status(400).json({ error: 'primaryImage (data URL) required' });
    return;
  }

  let primaryBlock: Anthropic.Messages.ImageBlockParam;
  let tafelBlock: Anthropic.Messages.ImageBlockParam | null = null;
  try {
    primaryBlock = toImageBlock(primaryImage);
    if (typeof tafelImage === 'string') tafelBlock = toImageBlock(tafelImage);
  } catch {
    res.status(400).json({ error: 'invalid_image_data' });
    return;
  }

  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: 'text', text: 'Foto 1 (Werkfoto):' },
    primaryBlock,
  ];
  if (tafelBlock) {
    content.push({ type: 'text', text: 'Foto 2 (Tafel/Beschriftung):' }, tafelBlock);
  }
  content.push({ type: 'text', text: 'Bitte die Felder gemäß Systemanweisung extrahieren.' });

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
      output_config: { format: zodOutputFormat(RecognitionSchema) },
    });

    if (!response.parsed_output) {
      res.status(502).json({ error: 'parse_failed' });
      return;
    }
    res.status(200).json(response.parsed_output);
  } catch (e) {
    console.error('recognize: Anthropic-Aufruf fehlgeschlagen', e);
    res.status(502).json({ error: 'recognition_failed' });
  }
}

function toImageBlock(dataUrl: string): Anthropic.Messages.ImageBlockParam {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('invalid data URL');
  return {
    type: 'image',
    source: { type: 'base64', media_type: match[1] as 'image/jpeg', data: match[2] },
  };
}
