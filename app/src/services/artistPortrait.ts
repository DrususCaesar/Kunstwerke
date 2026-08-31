/**
 * Automatische Künstler-Porträts über die kostenlose Wikipedia/Wikimedia-API
 * (kein API-Key nötig, MediaWiki erlaubt anonyme CORS-Anfragen via
 * `origin=*`). Sucht den bestätigten Künstlernamen, nimmt das Titelbild des
 * besten Treffers. Kein Treffer → `null`, dann bleibt der Initialen-Platzhalter.
 */

function searchUrl(host: string, name: string): string {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: name,
    gsrlimit: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '400',
  });
  return `https://${host}/w/api.php?${params.toString()}`;
}

interface MediaWikiPage {
  thumbnail?: { source: string };
}

async function fetchThumbnail(host: string, name: string): Promise<string | null> {
  const res = await fetch(searchUrl(host, name));
  if (!res.ok) return null;
  const data = await res.json();
  const pages: Record<string, MediaWikiPage> | undefined = data?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  return page?.thumbnail?.source ?? null;
}

/** Deutsche Wikipedia zuerst (kunsthistorisch übliche Namen, Konzept 6), sonst Englisch. */
export async function fetchArtistPortrait(artistCall: string): Promise<string | null> {
  try {
    const de = await fetchThumbnail('de.wikipedia.org', artistCall);
    if (de) return de;
    return await fetchThumbnail('en.wikipedia.org', artistCall);
  } catch (e) {
    console.error('Künstler-Porträt konnte nicht geladen werden', e);
    return null;
  }
}
