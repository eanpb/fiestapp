/* ══════════════════════════════════════════
   FIESTAPP — Frontend Logic
   ══════════════════════════════════════════ */

let allEvents = [];
let map;
let markers = [];
let activeGenre = 'Todos';

// ── Genre color map ──
const genreColors = {
  'Electrónica': '#a855f7',
  'Reggaetón': '#ec4899',
  'Techno': '#06b6d4',
  'Salsa': '#f97316',
  'Trap': '#ef4444',
  'House': '#10b981',
  'Rock': '#eab308',
  'Afrobeats': '#f59e0b'
};

const genreEmojis = {
  'Electrónica': '⚡',
  'Reggaetón': '🔥',
  'Techno': '🎛️',
  'Salsa': '💃',
  'Trap': '🎤',
  'House': '🏠',
  'Rock': '🎸',
  'Afrobeats': '🥁'
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initScrollEffects();
});

async function initApp() {
  try {
    await loadGenres();
    await loadEvents();
  } catch(e) { console.error('Error loading data:', e); }
  try {
    initMap();
  } catch(e) { console.error('Error loading map:', e); }
}

// ── Scroll effects ──
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Navbar bg
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active nav link + tab bar
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
    // Update tab bar
    document.querySelectorAll('.tab-item').forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === current) tab.classList.add('active');
    });
  });
}

// ── Load genres ──
async function loadGenres() {
  const res = await fetch('/api/genres');
  const genres = await res.json();
  const container = document.getElementById('genreFilters');
  container.innerHTML = genres.map(g => `
    <button class="genre-btn ${g === 'Todos' ? 'active' : ''}" onclick="filterByGenre('${g}')">
      ${g !== 'Todos' ? (genreEmojis[g] || '🎵') + ' ' : ''}${g}
    </button>
  `).join('');
}

// ── Load events ──
async function loadEvents(search = '') {
  const params = new URLSearchParams();
  if (activeGenre !== 'Todos') params.set('genre', activeGenre);
  if (search) params.set('search', search);

  const res = await fetch('/api/events?' + params);
  allEvents = await res.json();
  renderEvents(allEvents);
  if (map) updateMapMarkers(allEvents);
}

// ── Render event cards ──
function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  if (events.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem; color:var(--text-secondary);">
        <p style="font-size:2rem; margin-bottom:1rem;">😔</p>
        <p>No se encontraron eventos</p>
      </div>`;
    return;
  }
  grid.innerHTML = events.map((e, i) => `
    <div class="event-card" onclick="openModal(${e.id})" style="animation-delay:${i * 0.06}s">
      <div class="card-img">
        <img src="${e.image}" alt="${e.title}" loading="lazy" />
        <div class="card-img-overlay"></div>
        <span class="card-genre" style="background:${genreColors[e.genre] || '#a855f7'}">${genreEmojis[e.genre] || '🎵'} ${e.genre}</span>
        <span class="card-price">${formatPrice(e.price, e.currency)}</span>
      </div>
      <div class="card-body">
        <div class="card-date">${formatDate(e.date)} · ${e.time}</div>
        <div class="card-title">${e.title}</div>
        <div class="card-subtitle">${e.subtitle}</div>
        <div class="card-artists">
          ${e.artists.map(a => `<span class="artist-tag">${a}</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="card-venue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
            ${e.venue}
          </div>
          <div class="card-attending"><span>${e.attending}</span> asistirán</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Genre filter ──
function filterByGenre(genre) {
  activeGenre = genre;
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().includes(genre));
  });
  loadEvents(document.getElementById('searchInput').value);
}

// ── Search ──
let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => loadEvents(e.target.value), 300);
    });
  }
});

function searchFromHero() {
  const val = document.getElementById('heroSearch').value;
  document.getElementById('searchInput').value = val;
  loadEvents(val);
  document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
}

// ── Map ──
function initMap() {
  map = L.map('mapContainer', { zoomControl: false }).setView([4.66, -74.07], 12);

  L.control.zoom({ position: 'topright' }).addTo(map);

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  updateMapMarkers(allEvents);
}

function updateMapMarkers(events) {
  // Remove existing
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  events.forEach(e => {
    const color = genreColors[e.genre] || '#a855f7';
    const emoji = genreEmojis[e.genre] || '🎵';

    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-marker" style="background:${color};">${emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([e.lat, e.lng], { icon }).addTo(map);

    marker.bindPopup(`
      <div class="marker-popup">
        <h4>${e.title}</h4>
        <p>${e.venue}</p>
        <p>${formatDate(e.date)} · ${e.time}</p>
        <div class="popup-price">${formatPrice(e.price, e.currency)}</div>
      </div>
    `);

    marker.on('click', () => showSidebarEvent(e));
    markers.push(marker);
  });

  // Fit bounds
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

function showSidebarEvent(e) {
  const sidebar = document.getElementById('mapSidebar');
  sidebar.innerHTML = `
    <div class="sidebar-event">
      <div class="se-img"><img src="${e.image}" alt="${e.title}" /></div>
      <span class="se-genre">${genreEmojis[e.genre] || '🎵'} ${e.genre}</span>
      <h3>${e.title}</h3>
      <p class="se-sub">${e.subtitle}</p>
      <div class="se-info">
        <div class="se-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(e.date)} · ${e.time}
        </div>
        <div class="se-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
          ${e.venue} — ${e.address}
        </div>
        <div class="se-info-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${e.attending} / ${e.capacity} asistentes
        </div>
      </div>
      <div class="se-artists">
        ${e.artists.map(a => `<span class="artist-tag">${a}</span>`).join('')}
      </div>
      <div class="se-price">${formatPrice(e.price, e.currency)}</div>
      <button class="btn-primary" onclick="openModal(${e.id})">🎟️ Ver Detalles</button>
    </div>
  `;
}

// ── Modal ──
function openModal(id) {
  const e = allEvents.find(ev => ev.id === id);
  if (!e) return;

  document.getElementById('modalImg').innerHTML = `<img src="${e.image}" alt="${e.title}" />`;
  document.getElementById('modalTags').innerHTML = e.tags.map(t => `<span class="modal-tag">${t}</span>`).join('');
  document.getElementById('modalTitle').textContent = e.title;
  document.getElementById('modalSubtitle').textContent = e.subtitle;
  document.getElementById('modalDate').textContent = formatDate(e.date);
  document.getElementById('modalTime').textContent = e.time + 'h';
  document.getElementById('modalVenue').textContent = e.venue + ' — ' + e.address;
  document.getElementById('modalDescription').textContent = e.description;
  document.getElementById('modalArtists').innerHTML = e.artists.map(a => `<span class="artist-chip">${a}</span>`).join('');
  document.getElementById('modalPrice').textContent = formatPrice(e.price, e.currency);
  const pct = Math.round((e.attending / e.capacity) * 100);
  document.getElementById('modalCapFill').style.width = pct + '%';
  document.getElementById('modalCapText').textContent = `${pct}% lleno (${e.attending}/${e.capacity})`;

  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ── Helpers ──
function formatPrice(price, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency, minimumFractionDigits: 0
  }).format(price);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}
