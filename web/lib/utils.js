export const GENRES = [
  { name: 'Todos', emoji: '🎉', color: '#c8ff00' },
  { name: 'Techno', emoji: '🔊', color: '#ff0055' },
  { name: 'House', emoji: '🏠', color: '#00ccff' },
  { name: 'Deep House', emoji: '🌊', color: '#0088cc' },
  { name: 'Reggaeton', emoji: '🔥', color: '#ff6600' },
  { name: 'Hip-Hop', emoji: '🎤', color: '#ffcc00' },
  { name: 'Electronic', emoji: '⚡', color: '#aa00ff' },
  { name: 'Rock', emoji: '🎸', color: '#ff2222' },
  { name: 'Pop', emoji: '🎵', color: '#ff66cc' },
  { name: 'Salsa', emoji: '💃', color: '#ff4488' },
  { name: 'Vallenato', emoji: '🪗', color: '#ffaa44' },
  { name: 'Cumbia', emoji: '🥁', color: '#44ddaa' },
  { name: 'Latin', emoji: '🌴', color: '#ff8844' },
];

export function getGenreColor(genre) {
  const g = GENRES.find(g => g.name === genre);
  return g ? g.color : '#c8ff00';
}

export function getGenreEmoji(genre) {
  const g = GENRES.find(g => g.name === genre);
  return g ? g.emoji : '🎉';
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
