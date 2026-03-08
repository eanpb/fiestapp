'use client';
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import EventCard from '@/components/EventCard';
import GenreFilter from '@/components/GenreFilter';
import { AuthProvider } from '@/lib/auth';
import { getEvents } from '@/lib/api';
import { FiSearch, FiX, FiFilter, FiTrendingUp } from 'react-icons/fi';

function ExplorePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState(null);
  const [search, setSearch] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (genre) params.genre = genre;
      if (search) params.search = search;
      if (showFeatured) params.featured = 'true';
      const data = await getEvents(params);
      setEvents(data.events || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [genre, search, showFeatured]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="page-container">
          <h1 className="text-3xl font-black mb-6">Explorar Eventos</h1>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar eventos, artistas, venues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-11 !pr-10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFeatured(!showFeatured)}
              className={showFeatured ? 'btn-primary !py-2.5 flex items-center gap-2 text-sm' : 'btn-secondary !py-2.5 flex items-center gap-2 text-sm'}
            >
              <FiTrendingUp size={16} /> Destacados
            </button>
          </div>

          <GenreFilter selected={genre} onSelect={setGenre} />

          <div className="mt-4 text-sm text-text-muted mb-6">
            {events.length} evento{events.length !== 1 ? 's' : ''}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-[16/10] shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 shimmer rounded" />
                    <div className="h-4 w-1/2 shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🔍</span>
              <h3 className="text-xl font-bold mb-2">Sin resultados</h3>
              <p className="text-text-secondary">Intenta con otros filtros</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <ExplorePage />
    </AuthProvider>
  );
}
