import { useState } from 'react';
import { useMovies } from '@/hooks/useApi';
import MovieCard from './MovieCard';
import { Search } from 'lucide-react';

export default function MoviesPage() {
  const { movies, loading } = useMovies();
  const [search, setSearch] = useState('');

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#050505] pt-24">
      {/* Page Header */}
      <div className="px-5 lg:px-8 py-12" style={{
        background: 'linear-gradient(180deg, rgba(229, 9, 20, 0.08) 0%, #050505 100%)'
      }}>
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-white font-extrabold tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            All Movies
          </h1>
          <p className="text-[#A3A3A3] mt-2">Discover what&apos;s playing in our theaters</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-28">
        {/* Search */}
        <div className="relative max-w-[400px] mb-8">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/[0.08] rounded-sm px-4 py-3 pr-10 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filtered.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#A3A3A3]">No movies found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </main>
  );
}
