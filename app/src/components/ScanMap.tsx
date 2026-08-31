import { useEffect, useRef } from 'react';
import type * as Leaflet from 'leaflet';
import { placeholderBg } from '../lib/placeholder';

export interface MapPoint {
  lat: number;
  lng: number;
  seed: number;
  photoDataUrl?: string;
}

interface ScanMapProps {
  points: MapPoint[];
  height?: number;
}

/** "Ihre Scankarte" — Leaflet + OpenStreetMap, kein API-Key nötig. Eigene runde
 * Foto-Marker statt Leaflets Standard-Pin-Icons (spart die Marker-Asset-Fummelei).
 * Leaflet wird erst beim Mounten nachgeladen, damit es nicht im Haupt-Bundle
 * jeder Sitzung mitgeschleppt wird. */
export function ScanMap({ points, height = 170 }: ScanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markersLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    let cancelled = false;
    Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]).then(([leafletModule]) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const L = leafletModule.default;
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      renderMarkers(L, map, markersLayerRef.current, pointsRef.current);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    import('leaflet').then((leafletModule) => renderMarkers(leafletModule.default, mapRef.current!, markersLayerRef.current!, points));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  return <div ref={containerRef} style={{ height, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-card)' }} />;
}

function renderMarkers(L: typeof Leaflet, map: Leaflet.Map, markersLayer: Leaflet.LayerGroup, points: MapPoint[]) {
  markersLayer.clearLayers();
  points.forEach((p) => {
    L.marker([p.lat, p.lng], {
      icon: L.divIcon({ className: '', html: markerHtml(p), iconSize: [34, 34], iconAnchor: [17, 17] }),
    }).addTo(markersLayer);
  });

  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lng], 12);
  } else if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [24, 24] });
  } else {
    map.setView([51.1657, 10.4515], 5); // Deutschland als Startansicht ohne Scans
  }
  window.setTimeout(() => map.invalidateSize(), 50);
}

function markerHtml(p: MapPoint): string {
  const bg = p.photoDataUrl
    ? `background-image:url(${JSON.stringify(p.photoDataUrl)});background-size:cover;background-position:center`
    : `background:${placeholderBg(p.seed)}`;
  return `<div style="width:30px;height:30px;border-radius:50%;border:2px solid oklch(0.9 0.01 60);box-shadow:0 2px 6px rgba(0,0,0,0.4);${bg}"></div>`;
}
