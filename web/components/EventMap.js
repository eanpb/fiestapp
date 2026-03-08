'use client';
import { useEffect, useRef, useState } from 'react';
import { getGenreColor, getGenreEmoji, formatPrice, formatDate } from '@/lib/utils';

// Dynamic import for SSR safety - Leaflet needs window
export default function EventMap({ events, selectedEvent, onSelectEvent, center, zoom }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const L = require('leaflet');

    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: center || [4.65, -74.05],
        zoom: zoom || 6,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !ready) return;
    const L = require('leaflet');
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    events.forEach((event) => {
      if (!event.lat || !event.lng) return;

      const color = getGenreColor(event.genre);
      const emoji = getGenreEmoji(event.genre);
      const isSelected = selectedEvent?.id === event.id;

      const iconHtml = `
        <div style="
          width: ${isSelected ? '44px' : '36px'};
          height: ${isSelected ? '44px' : '36px'};
          background: ${color}${isSelected ? '' : '88'};
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '20px' : '16px'};
          box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${color}44;
          transition: all 0.2s;
          cursor: pointer;
          ${isSelected ? 'animation: pulse-accent 2s infinite;' : ''}
        ">${emoji}</div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const marker = L.marker([event.lat, event.lng], { icon })
        .addTo(map)
        .on('click', () => {
          onSelectEvent?.(event);
          map.flyTo([event.lat, event.lng], 13, { duration: 0.8 });
        });

      const popupContent = `
        <div style="min-width: 200px; font-family: Inter, sans-serif;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${event.title}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-bottom: 2px;">📍 ${event.venue}</div>
          <div style="color: #a0a0a0; font-size: 12px; margin-bottom: 6px;">📅 ${formatDate(event.date)}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: ${color}; font-size: 12px; font-weight: 600;">${emoji} ${event.genre}</span>
            <span style="color: #c8ff00; font-weight: 700; font-size: 13px;">${formatPrice(event.price)}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false, offset: [0, -10] });

      markersRef.current.push(marker);
    });
  }, [events, selectedEvent, ready]);

  useEffect(() => {
    if (selectedEvent && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedEvent.lat, selectedEvent.lng], 13, { duration: 0.8 });
    }
  }, [selectedEvent]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-2xl" style={{ minHeight: '400px' }} />
  );
}
