'use client';
import { useEffect, useRef } from 'react';
import { getGenreColor, getGenreAccent, formatPrice, formatDate } from '@/lib/utils';

function validCoord(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

export default function EventMap({
  events = [],
  selectedEvent,
  onSelectEvent,
  center,
  zoom,
  userLocation,
  className = 'w-full h-full rounded-2xl',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const userRadiusRef = useRef(null);

  // 1. Init map once
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (mapRef.current) return;

    const L = require('leaflet');

    const initialCenter =
      Array.isArray(center) && validCoord(center[0], center[1])
        ? center
        : [-33.45, -70.65];

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: zoom || 12,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      pane: 'overlayPane',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      userMarkerRef.current = null;
      userRadiusRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Render event markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require('leaflet');

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    events.forEach((event) => {
      const lat = Number(event.lat);
      const lng = Number(event.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const color = getGenreColor(event.genre);
      const accent = getGenreAccent(event.genre);
      const isSelected = selectedEvent?.id === event.id;

      const iconHtml = `
        <div style="
          width: ${isSelected ? '22px' : '18px'};
          height: ${isSelected ? '22px' : '18px'};
          background: ${color};
          border: 3px solid rgba(255,255,255,0.95);
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(15,23,42,0.25);
          transition: all 0.2s; cursor: pointer; position: relative;
          ${isSelected ? 'animation: pulse-accent 2s infinite;' : ''}
        ">
          <span style="position:absolute;inset:-7px;border-radius:999px;background:${color}22;"></span>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [isSelected ? 22 : 18, isSelected ? 22 : 18],
        iconAnchor: [isSelected ? 11 : 9, isSelected ? 11 : 9],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => {
          onSelectEvent?.(event);
          try { map.setView([lat, lng], 13, { animate: true, duration: 0.6 }); } catch (_) {}
        });

      marker.bindPopup(
        `<div style="min-width:220px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#f0f2f8;">${event.title}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:3px;">${event.venue}</div>
          <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:8px;">${formatDate(event.date)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;text-transform:uppercase;">${accent}</span>
            <span style="color:${color};font-weight:700;font-size:13px;">${formatPrice(event.price)}</span>
          </div>
        </div>`,
        { closeButton: false, offset: [0, -10] }
      );

      markersRef.current.push(marker);
    });
  }, [events, selectedEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Move to selected event
  useEffect(() => {
    if (!selectedEvent) return;
    const lat = Number(selectedEvent.lat);
    const lng = Number(selectedEvent.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const map = mapRef.current;
    if (!map) return;
    try { map.setView([lat, lng], 13, { animate: true, duration: 0.6 }); } catch (_) {}
  }, [selectedEvent]);

  // 4. Pan to center prop
  useEffect(() => {
    if (!Array.isArray(center) || center.length < 2) return;
    const lat = Number(center[0]);
    const lng = Number(center[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const map = mapRef.current;
    if (!map) return;
    try { map.setView([lat, lng], zoom || 12, { animate: true, duration: 0.6 }); } catch (_) {}
  }, [center, zoom]);

  // 5. User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require('leaflet');

    if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; }
    if (userRadiusRef.current) { map.removeLayer(userRadiusRef.current); userRadiusRef.current = null; }

    if (!userLocation) return;
    const lat = Number(userLocation.lat);
    const lng = Number(userLocation.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    userRadiusRef.current = L.circle([lat, lng], {
      radius: 280,
      color: 'rgba(139,92,246,0.16)',
      fillColor: 'rgba(139,92,246,0.10)',
      fillOpacity: 1,
      weight: 1,
      interactive: false,
    }).addTo(map);

    userMarkerRef.current = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#ffffff',
      weight: 3,
      fillColor: '#8b5cf6',
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup(
        '<div style="font-family:Plus Jakarta Sans,system-ui,sans-serif;font-weight:600;font-size:13px;color:#f0f2f8;">Tu ubicaci\u00f3n</div>',
        { closeButton: false, offset: [0, -8] }
      );
  }, [userLocation]);

  return <div ref={containerRef} className={className} style={{ minHeight: '400px' }} />;
}
