export const GENRES = [
  { name: 'Todos', color: '#8b5cf6', accent: 'All' },
  { name: 'Techno', color: '#7c3aed', accent: 'TN' },
  { name: 'House', color: '#0ea5e9', accent: 'HS' },
  { name: 'Deep House', color: '#2563eb', accent: 'DH' },
  { name: 'Reggaeton', color: '#f97316', accent: 'RG' },
  { name: 'Hip-Hop', color: '#f59e0b', accent: 'HH' },
  { name: 'Electronic', color: '#8b5cf6', accent: 'EL' },
  { name: 'Rock', color: '#ef4444', accent: 'RK' },
  { name: 'Pop', color: '#ec4899', accent: 'PP' },
  { name: 'Salsa', color: '#d946ef', accent: 'SA' },
  { name: 'Vallenato', color: '#f59e0b', accent: 'VL' },
  { name: 'Cumbia', color: '#14b8a6', accent: 'CU' },
  { name: 'Latin', color: '#fb7185', accent: 'LT' },
];

export function getGenreColor(genre) {
  const g = GENRES.find(g => g.name === genre);
  return g ? g.color : '#c8ff00';
}

export function getGenreAccent(genre) {
  const g = GENRES.find(g => g.name === genre);
  return g ? g.accent : 'EV';
}

export function formatPrice(price, currency = 'COP') {
  if (!price || price === 0) return 'Gratis';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}
