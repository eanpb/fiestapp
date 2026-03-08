'use client';
import { GENRES } from '@/lib/utils';

export default function GenreFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {GENRES.map((g) => (
        <button
          key={g.name}
          onClick={() => onSelect(g.name === 'Todos' ? null : g.name)}
          className={
            (selected === g.name || (g.name === 'Todos' && !selected))
              ? 'genre-chip-active'
              : 'genre-chip-inactive'
          }
        >
          <span className="mr-1">{g.emoji}</span> {g.name}
        </button>
      ))}
    </div>
  );
}
