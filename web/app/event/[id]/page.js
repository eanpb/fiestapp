'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AuthProvider, useAuth } from '@/lib/auth';
import { getEvent, attendEvent, unattendEvent } from '@/lib/api';
import { formatPrice, formatDate, formatTime, getGenreColor, getGenreEmoji } from '@/lib/utils';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign, FiArrowLeft, FiHeart, FiCheck, FiShare2, FiUser } from 'react-icons/fi';

const EventMapMini = dynamic(() => import('@/components/EventMap'), { ssr: false });

function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setAttending(data.myStatus === 'going');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAttend = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      if (attending) {
        await unattendEvent(id);
        setAttending(false);
        setEvent(prev => ({ ...prev, attendeeCount: (prev.attendeeCount || 1) - 1 }));
      } else {
        await attendEvent(id, 'going');
        setAttending(true);
        setEvent(prev => ({ ...prev, attendeeCount: (prev.attendeeCount || 0) + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="page-container pt-[88px]">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-[21/9] shimmer rounded-2xl mb-6" />
            <div className="h-8 w-2/3 shimmer rounded mb-3" />
            <div className="h-5 w-1/3 shimmer rounded mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 shimmer rounded-xl" />
              <div className="h-24 shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">😕</span>
          <h2 className="text-xl font-bold mb-2">Evento no encontrado</h2>
          <Link href="/" className="text-accent hover:underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const genreColor = getGenreColor(event.genre);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="pt-[88px]">
        {/* Hero Image */}
        <div className="relative h-[42vh] sm:h-[52vh] overflow-hidden">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 glass rounded-full p-2.5 hover:bg-surface-2 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>

          {/* Share button */}
          <button className="absolute top-4 right-4 glass rounded-full p-2.5 hover:bg-surface-2 transition-colors">
            <FiShare2 size={20} />
          </button>

          {/* Genre badge on image */}
          <div className="absolute bottom-6 left-6">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-lg"
              style={{ backgroundColor: `${genreColor}22`, color: genreColor, border: `1px solid ${genreColor}44` }}
            >
              {getGenreEmoji(event.genre)} {event.genre}
            </span>
          </div>
        </div>

        <div className="page-container -mt-6 relative z-10 pb-32">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-2 animate-fade-in">
              {event.title}
            </h1>

            {event.featured && (
              <span className="inline-block bg-accent text-bg px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-4">
                ⭐ Evento Destacado
              </span>
            )}

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 mb-8">
              <div className="card p-4 text-center">
                <FiCalendar size={20} className="text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold">{formatDate(event.date)}</p>
                <p className="text-xs text-text-muted">{formatTime(event.date)}</p>
              </div>
              <div className="card p-4 text-center">
                <FiMapPin size={20} className="text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold line-clamp-1">{event.venue}</p>
                <p className="text-xs text-text-muted line-clamp-1">{event.address}</p>
              </div>
              <div className="card p-4 text-center">
                <FiDollarSign size={20} className="text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold">{formatPrice(event.price, event.currency)}</p>
                {event.minAge && <p className="text-xs text-text-muted">+{event.minAge} años</p>}
              </div>
              <div className="card p-4 text-center">
                <FiUsers size={20} className="text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold">{event.attendeeCount || 0} asistentes</p>
                {event.capacity && <p className="text-xs text-text-muted">de {event.capacity}</p>}
              </div>
            </div>

            {/* Two columns: content + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Sobre el evento</h2>
                  <p className="text-text-secondary leading-relaxed">{event.description}</p>
                </div>

                {/* Artists */}
                {event.artists && event.artists.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">🎵 Line-up</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.artists.map((artist, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm font-medium hover:border-accent/40 transition-colors"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friends Going */}
                {event.friendsGoing && event.friendsGoing.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">👥 Amigos que van</h2>
                    <div className="flex flex-wrap gap-3">
                      {event.friendsGoing.map((friend) => (
                        <Link key={friend.id} href={`/user/${friend.id}`} className="flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2 hover:bg-surface-3 transition-colors">
                          <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full" />
                          <span className="text-sm font-medium">{friend.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                {event.lat && event.lng && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">📍 Ubicación</h2>
                    <div className="h-[300px] rounded-2xl overflow-hidden border border-border">
                      <EventMapMini
                        events={[event]}
                        center={[event.lat, event.lng]}
                        zoom={15}
                      />
                    </div>
                    <p className="text-sm text-text-muted mt-2">{event.address}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Organizer */}
                {event.organizer && (
                  <div className="card p-4">
                    <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Organizador</h3>
                    <div className="flex items-center gap-3">
                      <img
                        src={event.organizer.avatar}
                        alt={event.organizer.name}
                        className="w-12 h-12 rounded-full bg-surface-2"
                      />
                      <div>
                        <p className="font-bold">{event.organizer.name}</p>
                        <p className="text-sm text-text-muted">@{event.organizer.username}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Card */}
                <div className="card p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Detalles</h3>
                  {event.minAge && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiUser size={14} className="text-accent" />
                      <span>Edad mínima: {event.minAge}+</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiUsers size={14} className="text-accent" />
                      <span>Capacidad: {event.capacity} personas</span>
                    </div>
                  )}
                  {event.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock size={14} className="text-accent" />
                      <span>Termina: {formatDate(event.endDate)} {formatTime(event.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass">
          <div className="page-container flex items-center justify-between gap-4 py-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div>
              <p className="font-bold text-lg" style={{ color: genreColor }}>{formatPrice(event.price, event.currency)}</p>
              <p className="text-xs text-text-muted">{formatDate(event.date)} · {event.venue}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAttend}
                className={attending ? 'btn-primary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
                style={attending ? { backgroundColor: '#00cc88' } : {}}
              >
                {attending ? <FiCheck size={18} /> : <FiHeart size={18} />}
                {attending ? 'Asistiré ✓' : 'Quiero ir'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <EventDetailPage />
    </AuthProvider>
  );
}
