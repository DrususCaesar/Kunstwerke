import type { GeoLocation } from '../types';

/**
 * "Museen in der Nähe" ohne Karten-/Places-API-Key: die Overpass-API fragt
 * OpenStreetMap direkt nach `tourism=museum` in der Umgebung ab.
 */

export interface NearbyMuseum {
  id: string;
  name: string;
  distanceKm: number;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineKm(a: GeoLocation, b: GeoLocation): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function fetchNearbyMuseums(location: GeoLocation, radiusMeters = 5000, limit = 6): Promise<NearbyMuseum[]> {
  const query = `[out:json][timeout:15];(node["tourism"="museum"](around:${radiusMeters},${location.lat},${location.lng});way["tourism"="museum"](around:${radiusMeters},${location.lat},${location.lng}););out center ${limit * 3};`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const elements: OverpassElement[] = data?.elements ?? [];
    return elements
      .map((el) => {
        const name = el.tags?.name;
        if (!name) return null;
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (lat === undefined || lon === undefined) return null;
        return { id: String(el.id), name, distanceKm: haversineKm(location, { lat, lng: lon }) };
      })
      .filter((m): m is NearbyMuseum => m !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  } catch (e) {
    console.error('Museen in der Nähe konnten nicht geladen werden', e);
    return [];
  }
}
