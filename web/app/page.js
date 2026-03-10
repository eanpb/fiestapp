'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GenreFilter from '@/components/GenreFilter';
import { AuthProvider } from '@/lib/auth';
import { getEvents } from '@/lib/api';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import {
  FiSearch, FiMapPin, FiClock, FiChevronRight, FiX,
  FiList, FiMap as FiMapIcon,
  FiLoader, FiAlertCircle, FiRefreshCw, FiCalendar, FiMenu, FiNavigation,
} from 'react-icons/fi';

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

// ─── utils ──────────────────────────────────────────────────────────────────
function calcDist(from, to) {
  if (!from || !to?.lat || !to?.lng) return null;
  const R = 6371, r = v => v * Math.PI / 180;
  const dLat = r(to.lat - from.lat), dLng = r(to.lng - from.lng);
  const a = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(r(from.lat)) * Math.cos(r(to.lat));
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function fmtDist(d) {
  if (d == null) return null;
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(d < 10 ? 1 : 0)}km`;
}

// ─── Card grande horizontal (featured) ───────────────────────────────────────
function FeaturedCard({ event, distance, index, onClick, selected }) {
  return (
    <Link
      href={`/event/${event.id}`}
      onClick={onClick}
      className="relative flex-shrink-0 overflow-hidden border transition-all duration-300"
      style={{
        width: '75vw', maxWidth: 300,
        height: 400,
        borderRadius: '2rem',
        borderColor: selected ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.07)',
        boxShadow: selected
          ? '0 8px 16px rgba(0,0,0,0.25), 0 32px 72px rgba(139,92,246,0.28), 0 0 0 1px rgba(139,92,246,0.22)'
          : '0 8px 16px rgba(0,0,0,0.2), 0 32px 80px rgba(0,0,0,0.55)',
        opacity: 0,
        willChange: 'transform, opacity',
        animation: `cardEntrance 0.38s cubic-bezier(0.22,1,0.36,1) forwards`,
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <img
        src={event.imageUrl}
        alt={event.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover image-pan"
      />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,3,6,0.98) 0%, rgba(2,3,6,0.72) 32%, rgba(2,3,6,0.22) 58%, transparent 82%)' }} />
      {selected && (
        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] ring-1 ring-accent/30" />
      )}

      <div className="absolute left-4 top-4">
        <span style={{ borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '4px 11px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'white' }}>
          {event.genre}
        </span>
      </div>
      {event.featured && (
        <div className="absolute right-4 top-4">
          <span style={{ borderRadius: '999px', background: 'rgba(139,92,246,0.92)', padding: '4px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>
            ★ Top
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="mb-1.5 line-clamp-2 text-[1.2rem] font-semibold leading-tight tracking-[-0.04em] text-white">
          {event.title}
        </h3>
        <p className="mb-4 text-[0.76rem] text-white/60">{event.venue}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[1.15rem] font-bold tracking-[-0.04em] text-white">{formatPrice(event.price, event.currency)}</div>
            {distance && <div className="text-[0.68rem] text-white/50">{distance} de ti</div>}
          </div>
          <div style={{ borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '6px 13px', fontSize: '0.71rem', color: 'rgba(255,255,255,0.75)' }}>
            {formatDate(event.date)}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Card lista compacta ──────────────────────────────────────────────────────
function CompactCard({ event, selected, onTap, distance, index }) {
  return (
    <Link
      href={`/event/${event.id}`}
      onMouseEnter={onTap}
      onClick={onTap}
      className="group flex items-center gap-3.5 border p-3 transition-all duration-200"
      style={{
        borderRadius: '1.35rem',
        borderColor: selected ? 'rgba(139,92,246,0.38)' : 'rgba(255,255,255,0.06)',
        background: selected
          ? 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.05))'
          : 'linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))',
        boxShadow: selected
          ? '0 4px 12px rgba(0,0,0,0.15), 0 16px 40px rgba(139,92,246,0.14)'
          : '0 2px 8px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.18)',
        opacity: 0,
        willChange: 'transform, opacity',
        animation: `cardEntrance 0.32s cubic-bezier(0.22,1,0.36,1) forwards`,
        animationDelay: `${index * 0.03}s`,
      }}
    >
      {/* Image — own overflow-hidden so text is NOT affected */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 72, height: 72, borderRadius: '1rem', minWidth: 72 }}>
        <img src={event.imageUrl} alt={event.title} loading="lazy" className="h-full w-full object-cover transition duration-400 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.38), transparent 60%)' }} />
      </div>
      {/* Text block — no overflow:hidden on parent so rounded border doesn't clip */}
      <div className="min-w-0 flex-1 pr-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
            {event.genre}
          </span>
          <span className="ml-auto shrink-0 text-[0.84rem] font-bold tracking-[-0.02em] text-white">{formatPrice(event.price, event.currency)}</span>
        </div>
        <h3 className="truncate text-[0.92rem] font-semibold tracking-[-0.025em] text-white">{event.title}</h3>
        <p className="mt-1 truncate text-[0.71rem]" style={{ color: 'rgba(255,255,255,0.42)' }}>{event.venue}{distance ? <span style={{ color: 'rgba(139,92,246,0.85)', marginLeft: 6 }}>{distance}</span> : null}</p>
      </div>
      <FiChevronRight size={14} className="shrink-0" style={{ color: 'rgba(255,255,255,0.22)', marginLeft: 4 }} />
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-[1.2rem] border border-white/6 bg-white/[0.03] p-3">
      <div className="h-[72px] w-[72px] flex-shrink-0 rounded-[0.9rem] shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 rounded-full shimmer" />
        <div className="h-4 w-36 rounded-full shimmer" />
        <div className="h-3 w-24 rounded-full shimmer" />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff4444]/20 bg-[#ff4444]/[0.08]">
        <FiAlertCircle size={22} className="text-[#ff4444]" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">No se pudo cargar</h3>
      <p className="mb-5 text-sm text-text-muted">Verifica tu conexión o inténtalo de nuevo</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
      >
        <FiRefreshCw size={14} /> Reintentar
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [genre, setGenre] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('split');
  const [userLocation, setUserLocation] = useState(null);
  const [locationState, setLocationState] = useState('idle');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const sheetRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (genre) params.genre = genre;
      if (search) params.search = search;
      const data = await getEvents(params);
      const list = Array.isArray(data) ? data : (data.events || data.data || []);
      setEvents(list);
      if (list.length > 0) setSelectedEvent(list[0]);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [genre, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const displayed = useMemo(() => {
    if (!userLocation) return events;
    return [...events].sort((a, b) => {
      const da = calcDist(userLocation, a) ?? Infinity;
      const db = calcDist(userLocation, b) ?? Infinity;
      return da - db;
    });
  }, [events, userLocation]);

  const handleLocation = useCallback(() => {
    if (!navigator?.geolocation) return;
    setLocationState('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        setLocationState('active');
      },
      () => setLocationState('idle'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // ── Mobile layout ────────────────────────────────────────────────────────────
  const MobileView = (
    <div className="lg:hidden">
      <div className="relative h-[100dvh] overflow-hidden bg-[#030408]">

        {/* Fullscreen map */}
        <EventMap
          events={displayed}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
          zoom={userLocation ? 13 : undefined}
          userLocation={userLocation}
          className="h-full w-full"
        />

        {/* Subtle vignette edges – no big gradient */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.22) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.38) 0%, transparent 55%)'
        }} />

        {/* ── Top-left: hamburger ── */}
        <div className="absolute z-[1200]" style={{ top: 'calc(env(safe-area-inset-top) + 14px)', left: 16 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="glass-strong flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-[1rem]"
          >
            <span className="block h-[2px] w-5 rounded-full bg-white" />
            <span className="block h-[2px] w-5 rounded-full bg-white" />
            <span className="block h-[2px] w-5 rounded-full bg-white" />
          </button>
        </div>

        {/* ── Top-right: location ── */}
        <div className="absolute z-[1200]" style={{ top: 'calc(env(safe-area-inset-top) + 14px)', right: 16 }}>
          <button
            onClick={handleLocation}
            disabled={locationState === 'loading'}
            className={`glass-strong flex h-12 w-12 items-center justify-center rounded-[1rem] transition ${locationState === 'active' ? 'ring-1 ring-accent/60' : ''}`}
          >
            {locationState === 'loading'
              ? <FiLoader size={17} className="animate-spin text-white" />
              : <FiNavigation size={17} className={locationState === 'active' ? 'text-accent' : 'text-white'} />
            }
          </button>
        </div>

        {/* ── Bottom search bar ── */}
        <div
          className="absolute inset-x-4 z-[1100]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
        >
          {/* Search input (visible when tapped) */}
          {searchOpen ? (
            <div className="glass-strong flex items-center gap-3 rounded-[1.4rem] px-4 py-3.5 animate-fade-in">
              <FiSearch size={16} className="shrink-0 text-white/50" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar eventos, venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-[0.95rem] text-white outline-none placeholder:text-white/40"
              />
              <button onClick={() => { setSearchOpen(false); setSearch(''); }}>
                <FiX size={17} className="text-white/50" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Search pill */}
              <button
                onClick={() => setSearchOpen(true)}
                className="glass-strong flex flex-1 items-center gap-3 rounded-[1.4rem] px-4 py-3.5"
              >
                <FiSearch size={16} className="shrink-0 text-white/50" />
                <span className="text-[0.92rem] text-white/45">Buscar eventos...</span>
              </button>
              {/* Events count / list toggle */}
              <button
                onClick={() => setListOpen(true)}
                className="glass-strong flex items-center gap-2 rounded-[1.4rem] px-4 py-3.5 whitespace-nowrap"
              >
                <FiList size={15} className="text-white" />
                <span className="text-[0.85rem] font-semibold text-white">
                  {loading ? '...' : displayed.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── Left drawer ── */}
        {drawerOpen && (
          <div className="absolute inset-0 z-[1500]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/55"
              style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Panel */}
            <div
              className="absolute inset-y-0 left-0 flex flex-col"
              style={{
                width: '82vw', maxWidth: 340,
                background: 'linear-gradient(160deg,rgba(13,14,22,0.98) 0%,rgba(8,9,16,1) 100%)',
                backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '16px 0 80px rgba(0,0,0,0.7)',
                paddingTop: 'env(safe-area-inset-top)',
                animation: 'slideInDrawer 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-6 pt-8">
                <div>
                  <div className="mb-0.5 text-[1.4rem] font-bold tracking-[-0.04em] text-white">Fiestapp</div>
                  <div className="text-[0.72rem] font-medium tracking-[0.12em] uppercase" style={{ color: 'rgba(139,92,246,0.8)' }}>Descubre la noche</div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] text-white/50 transition hover:bg-white/[0.07]"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-6 mb-6 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />

              {/* Genre — horizontal scroll, full-width so nothing is hard-clipped */}
              <div className="mb-7">
                <p className="mb-3 px-6 text-[0.65rem] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>Género</p>
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1" style={{ paddingLeft: 24, paddingRight: 8 }}>
                  {['Todos','Techno','House','Deep House','Reggaeton','Salsa','Rock','Pop','Electronic'].map(g => {
                    const val = g === 'Todos' ? null : g;
                    const active = genre === val;
                    return (
                      <button
                        key={g}
                        onClick={() => { setGenre(val); setDrawerOpen(false); }}
                        className="shrink-0 rounded-full border px-4 py-2 text-[0.82rem] font-medium transition"
                        style={{
                          borderColor: active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)',
                          background: active ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#c4b5fd' : 'rgba(255,255,255,0.65)',
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                  <span className="shrink-0" style={{ minWidth: 16 }} />
                </div>
              </div>

              {/* Nav options */}
              <div className="mx-6 mb-5 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
              <nav className="flex flex-col gap-2 px-4 mb-4">
                {[
                  { icon: <FiMapIcon size={19} />, label: 'Explorar con mapa', sub: 'Vista general de eventos', color: '#3b82f6', bg: 'rgba(59,130,246,0.14)', action: () => setDrawerOpen(false) },
                  { icon: <FiList size={19} />, label: 'Lista de eventos', sub: `${displayed.length} disponibles`, color: '#a78bfa', bg: 'rgba(167,139,250,0.14)', action: () => { setDrawerOpen(false); setListOpen(true); } },
                  { icon: <FiNavigation size={19} />, label: 'Mi ubicación', sub: locationState === 'active' ? '✓ Activa' : 'Encontrar eventos cercanos', color: '#34d399', bg: 'rgba(52,211,153,0.14)', action: () => { handleLocation(); setDrawerOpen(false); } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-4 rounded-[1.2rem] px-4 py-3.5 text-left transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.055)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'; }}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem]" style={{ background: item.bg, border: `1px solid ${item.color}28` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.93rem] font-semibold text-white">{item.label}</div>
                      <div className="mt-0.5 truncate text-[0.74rem]" style={{ color: 'rgba(255,255,255,0.38)' }}>{item.sub}</div>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-auto px-6 pb-10 pt-2">
                <p className="text-[0.68rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 Fiestapp</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Event list panel (slides up) ── */}
        {listOpen && (
          <div className="absolute inset-0 z-[1400]">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setListOpen(false)}
            />
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col"
              style={{
                height: '88dvh',
                overflow: 'hidden',
                background: 'linear-gradient(170deg, #0e0f1a 0%, #090a13 100%)',
                borderTop: '1px solid rgba(155,109,255,0.12)',
                borderRadius: '2rem 2rem 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 -40px 120px rgba(0,0,0,0.4)',
                animation: 'slideUpPanel 0.32s cubic-bezier(0.22,1,0.36,1) forwards',
              }}
            >
              {/* Purple glow */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(155,109,255,0.12) 0%, transparent 70%)' }} />

              {/* Handle */}
              <div className="relative flex justify-center pb-2 pt-3 shrink-0">
                <div className="h-[5px] w-14 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Header */}
              <div className="relative flex shrink-0 items-center justify-between px-5 pb-4 pt-3">
                <div>
                  <h2 className="text-[1.25rem] font-bold tracking-[-0.04em] text-white">Eventos</h2>
                  <p className="mt-0.5 text-[0.73rem] font-medium" style={{ color: 'rgba(155,109,255,0.75)' }}>{displayed.length} disponibles</p>
                </div>
                <button
                  onClick={() => setListOpen(false)}
                  style={{
                    width: 36, height: 36, borderRadius: '0.8rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Genre chips — horizontal scroll in its own row */}
              <div
                className="no-scrollbar shrink-0 flex gap-2.5 overflow-x-auto"
                style={{ paddingLeft: 20, paddingBottom: 16, WebkitOverflowScrolling: 'touch' }}
              >
                {['Todos','Techno','House','Deep House','Reggaeton','Salsa','Rock','Pop','Electronic','Hip-Hop','Vallenato'].map(g => {
                  const val = g === 'Todos' ? null : g;
                  const active = genre === val;
                  return (
                    <button
                      key={g}
                      onClick={() => setGenre(val)}
                      style={{
                        flexShrink: 0,
                        borderRadius: '999px',
                        padding: '7px 15px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        border: `1px solid ${active ? 'rgba(155,109,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(155,109,255,0.18)' : 'rgba(255,255,255,0.04)',
                        color: active ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                        transition: 'all 0.15s',
                        boxShadow: active ? '0 0 16px rgba(155,109,255,0.18)' : 'none',
                      }}
                    >{g}</button>
                  );
                })}
                <span className="shrink-0" style={{ minWidth: 20 }} />
              </div>

              {/* Separator */}
              <div className="mx-5 shrink-0" style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />

              {/* List */}
              <div
                className="flex-1 overflow-y-auto px-4 pb-8 no-scrollbar"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}
              >
                {loading ? (
                  <div className="space-y-2.5 pt-2">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
                  </div>
                ) : error ? (
                  <ErrorState onRetry={fetchEvents} />
                ) : displayed.length === 0 ? (
                  <div className="py-16 text-center text-white/40">No hay eventos para estos filtros</div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {displayed.map((ev, i) => (
                      <CompactCard
                        key={ev.id}
                        event={ev}
                        selected={selectedEvent?.id === ev.id}
                        onTap={() => { setSelectedEvent(ev); setListOpen(false); }}
                        distance={fmtDist(calcDist(userLocation, ev))}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Desktop layout ───────────────────────────────────────────────────────────
  const DesktopView = (
    <div className="page-container hidden py-5 pb-7 lg:block">
      <div className="grid gap-5 lg:grid-cols-[430px_minmax(0,1fr)] xl:grid-cols-[470px_minmax(0,1fr)]">

        {/* Left panel */}
        <section className="depth-panel flex h-[calc(100dvh-120px)] min-h-[760px] flex-col overflow-hidden lg:sticky lg:top-[92px]">
          {/* Hero image */}
          <div className="shrink-0 px-4 pt-4 pb-3">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0a0b10]" style={{ height: 188 }}>
              {(selectedEvent?.imageUrl || displayed[0]?.imageUrl) ? (
                <img
                  src={selectedEvent?.imageUrl || displayed[0]?.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover image-pan"
                />
              ) : (
                <div className="h-full w-full" style={{ background: 'linear-gradient(135deg,#12101a,#0a0d15)' }} />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.55) 45%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="section-kicker mb-0.5">Descubrir</p>
                <h1 className="line-clamp-2 text-[1.7rem] font-semibold leading-[1.15] tracking-[-0.05em] text-white">
                  {selectedEvent?.title || 'La noche te llama'}
                </h1>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
              <input
                type="text"
                placeholder="Buscar evento o venue..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field !pl-11 !text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                  <FiX size={15} />
                </button>
              )}
            </div>

            <div className="mt-3">
              <GenreFilter selected={genre} onSelect={setGenre} />
            </div>

            <div className="mt-3">
              <button
                onClick={handleLocation}
                disabled={locationState === 'loading'}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition disabled:opacity-60 ${
                  locationState === 'active'
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.08]'
                }`}
              >
                {locationState === 'loading' ? <FiLoader size={13} className="animate-spin" /> : <FiNavigation size={13} />}
                {locationState === 'active' ? 'Ubicación activa' : 'Usar mi ubicación'}
              </button>
            </div>
          </div>

          {/* Results header */}
          <div className="flex shrink-0 items-center justify-between border-t border-b border-white/[0.06] px-4 py-2.5 text-sm text-text-muted">
            <span className="font-medium">{displayed.length} eventos</span>
            <button
              onClick={handleLocation}
              disabled={locationState === 'loading'}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition ${
                locationState === 'active'
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-white/8 bg-white/[0.04] text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              {locationState === 'loading' ? <FiLoader size={12} className="animate-spin" /> : <FiNavigation size={12} />}
              {locationState === 'active' ? 'Cercanos' : 'Ubicación'}
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
            ) : error ? (
              <ErrorState onRetry={fetchEvents} />
            ) : displayed.length === 0 ? (
              <div className="flex h-full items-center justify-center text-text-muted">No hay eventos</div>
            ) : (
              displayed.map((ev, i) => (
                <CompactCard
                  key={ev.id}
                  event={ev}
                  selected={selectedEvent?.id === ev.id}
                  onTap={() => setSelectedEvent(ev)}
                  distance={fmtDist(calcDist(userLocation, ev))}
                  index={i}
                />
              ))
            )}
          </div>
        </section>

        {/* Right - Map */}
        <section className="depth-panel relative h-[calc(100dvh-120px)] min-h-[760px] lg:sticky lg:top-[92px]">
          {/* Map tiles — clipped to rounded corners, popup card is outside this clip */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
            <EventMap
              events={displayed}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
              zoom={userLocation ? 13 : undefined}
              userLocation={userLocation}
            />
          </div>

          <div className="absolute left-5 right-5 top-5 z-[1000] flex justify-end">
            <div className="glass-strong rounded-full px-3 py-2 text-xs text-white/60">
              {userLocation ? 'Centrado en tu ubicación' : 'Vista general'}
            </div>
          </div>

          {selectedEvent && (
            <div className="absolute bottom-5 left-5 right-5 z-[1000]">
              <Link
                href={`/event/${selectedEvent.id}`}
                className="glass-strong animate-slide-up flex items-center gap-3 rounded-[1.5rem] p-3.5 transition hover:bg-white/[0.06]"
              >
                {selectedEvent.imageUrl && (
                  <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="h-14 w-14 flex-shrink-0 rounded-[1rem] object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-[0.93rem] font-semibold tracking-tight text-white">{selectedEvent.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-[0.78rem] text-text-muted">{selectedEvent.venue}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[0.93rem] font-bold text-white">{formatPrice(selectedEvent.price, selectedEvent.currency)}</div>
                  <FiChevronRight size={14} className="ml-auto mt-0.5 text-text-muted" />
                </div>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-white">
      <div className="hidden lg:block"><Navbar /></div>
      <main className="lg:pt-[86px]">
        {MobileView}
        {DesktopView}
      </main>
    </div>
  );
}

export default function Page() {
  return <AuthProvider><HomePage /></AuthProvider>;
}
