'use client';
import Link from 'next/link';
import { getGenreColor, getGenreEmoji, formatPrice, formatDate, formatTime } from '@/lib/utils';
import { FiMapPin, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';

export default function EventCard({ event, index = 0 }) {
  const genreColor = getGenreColor(event.genre);

  return (
    <Link href={`/event/${event.id}`}>
      <div
        className="card-hover group cursor-pointer"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Genre Badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
            style={{ backgroundColor: `${genreColor}22`, color: genreColor, border: `1px solid ${genreColor}44` }}
          >
            {getGenreEmoji(event.genre)} {event.genre}
          </div>

          {/* Price */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
            {formatPrice(event.price, event.currency)}
          </div>

          {/* Featured */}
          {event.featured && (
            <div className="absolute bottom-3 right-3 bg-accent text-bg px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider">
              ⭐ Destacado
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors line-clamp-1">
            {event.title}
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <FiCalendar size={14} className="text-accent shrink-0" />
              <span>{formatDate(event.date)}</span>
              <span className="text-text-muted">·</span>
              <FiClock size={14} className="text-text-muted shrink-0" />
              <span className="text-text-muted">{formatTime(event.date)}</span>
            </div>

            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <FiMapPin size={14} className="text-accent shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <FiUsers size={14} />
              <span>{event.attendeeCount || 0} asistentes</span>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-1.5">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-xs text-text-muted">{event.organizer.name?.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
