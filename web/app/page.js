'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import GenreFilter from '@/components/GenreFilter';
import { AuthProvider } from '@/lib/auth';
import { getEvents } from '@/lib/api';
import { formatPrice, formatDate, formatTime, getGenreColor, getGenreEmoji } from '@/lib/utils';
import { FiSearch, FiMapPin, FiCalendar, FiClock, FiChevronRight, FiX, FiList, FiMap as FiMapIcon } from 'react-icons/fi';
import Link from 'next/link';

const EventMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('split'); // 'split' | 'map' | 'list'

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (genre) params.genre = genre;
      if (search) params.search = search;
      const data = await getEvents(params);
      setEvents(data.events || data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [genre, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const featuredEvents = events.filter(e => e.featured);
  const regularEvents = events.filter(e => !e.featured);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
          <div className="page-container py-8 sm:py-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                Encuentra tu{' '}
                <span className="text-accent">próxima fiesta</span>
              </h1>
              <p className="mt-4 text-lg text-text-secondary max-w-lg">
                Descubre eventos, fiestas y festivales en Colombia. Mapa interactivo, géneros musicales y conecta con amigos.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mt-6 max-w-xl">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Buscar eventos, venues, artistas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field !pl-12 !pr-10"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                    <FiX size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Genre Filters */}
            <div className="mt-5">
              <GenreFilter selected={genre} onSelect={setGenre} />
            </div>
          </div>
        </section>

        {/* View Toggle */}
        <div className="page-container flex items-center justify-between mb-4">
          <p className="text-sm text-text-muted">
            {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
          </p>
          <div className="flex bg-surface rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('split')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'split' ? 'bg-accent text-bg' : 'text-text-secondary hover:text-text'}`}
            >
              Split
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'map' ? 'bg-accent text-bg' : 'text-text-secondary hover:text-text'}`}
            >
              <FiMapIcon size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-accent text-bg' : 'text-text-secondary hover:text-text'}`}
            >
              <FiList size={14} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="page-container pb-12">
          {view === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '600px' }}>
              {/* Map Side */}
              <div className="relative rounded-2xl overflow-hidden border border-border h-[500px] lg:h-auto lg:sticky lg:top-20">
                <EventMap
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />

                {/* Selected Event Preview */}
                {selectedEvent && (
                  <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 animate-slide-up">
                    <Link href={`/event/${selectedEvent.id}`} className="flex gap-3">
                      <img
                        src={selectedEvent.imageUrl}
                        alt={selectedEvent.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm line-clamp-1">{selectedEvent.title}</h4>
                        <p className="text-text-secondary text-xs mt-0.5 flex items-center gap-1">
                          <FiMapPin size={10} /> {selectedEvent.venue}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-text-muted">{formatDate(selectedEvent.date)}</span>
                          <span className="text-accent font-bold text-xs">{formatPrice(selectedEvent.price)}</span>
                        </div>
                      </div>
                      <FiChevronRight className="text-text-muted self-center shrink-0" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Events List Side */}
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
                  : events.map((event, i) => (
                    <div
                      key={event.id}
                      onMouseEnter={() => setSelectedEvent(event)}
                      className={`transition-all duration-200 rounded-2xl ${selectedEvent?.id === event.id ? 'ring-2 ring-accent/40' : ''}`}
                    >
                      <EventCard event={event} index={i} />
                    </div>
                  ))
                }
                {!loading && events.length === 0 && <EmptyState />}
              </div>
            </div>
          )}

          {view === 'map' && (
            <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
              <EventMap
                events={events}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />
              {selectedEvent && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass rounded-xl p-4 animate-slide-up w-[90%] max-w-md z-[1000]">
                  <Link href={`/event/${selectedEvent.id}`} className="flex gap-4">
                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold line-clamp-1">{selectedEvent.title}</h4>
                      <p className="text-text-secondary text-sm mt-1"><FiMapPin size={12} className="inline mr-1" />{selectedEvent.venue}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-text-muted">{formatDate(selectedEvent.date)} · {formatTime(selectedEvent.date)}</span>
                        <span className="text-accent font-bold">{formatPrice(selectedEvent.price)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {view === 'list' && (
            <>
              {/* Featured Section */}
              {featuredEvents.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    ⭐ <span>Destacados</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredEvents.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Events */}
              <h2 className="text-2xl font-bold mb-4">🎉 Todos los eventos</h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="card">
      <div className="aspect-[16/10] shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 shimmer rounded" />
        <div className="h-4 w-1/2 shimmer rounded" />
        <div className="h-4 w-2/3 shimmer rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">🔍</span>
      <h3 className="text-xl font-bold mb-2">No se encontraron eventos</h3>
      <p className="text-text-secondary">Intenta cambiar los filtros o buscar otra cosa</p>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}
