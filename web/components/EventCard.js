'use client';
import Link from 'next/link';
import { getGenreColor, formatPrice, formatDate, formatTime } from '@/lib/utils';
import { FiMapPin, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';

export default function EventCard({ event, index = 0 }) {
  const genreColor = getGenreColor(event.genre);

  return (
    <Link href={`/event/${event.id}`}>
      <div
        className="card-hover group cursor-pointer"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-[#07090d]/25 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

          <div
            className="absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-xl"
            style={{ backgroundColor: `${genreColor}14`, color: '#f5f7fb', borderColor: `${genreColor}33` }}
          >
            {event.genre}
          </div>

          <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
            {formatPrice(event.price, event.currency)}
          </div>

          {event.featured && (
            <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
              Featured
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-white/60">{formatDate(event.date)}</p>
              <h3 className="max-w-[18rem] text-xl font-semibold tracking-[-0.03em] text-white transition-colors group-hover:text-white">
                {event.title}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-1 flex items-center gap-2 text-text-muted">
                <FiCalendar size={14} className="text-accent shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.14em]">Fecha</span>
              </div>
              <p className="font-medium text-text-secondary">{formatDate(event.date)}</p>
              <p className="mt-0.5 text-xs text-text-muted">{formatTime(event.date)}</p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-1 flex items-center gap-2 text-text-muted">
                <FiMapPin size={14} className="text-accent shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.14em]">Venue</span>
              </div>
              <p className="line-clamp-2 font-medium text-text-secondary">{event.venue}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-1">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <FiUsers size={14} className="text-accent" />
              <span>{event.attendeeCount || 0} asistentes</span>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-2">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="h-6 w-6 rounded-full border border-white/10"
                />
                <span className="text-xs text-text-secondary">{event.organizer.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
