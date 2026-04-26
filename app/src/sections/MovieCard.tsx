import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MovieResponse } from '@/types/api';

const API_BASE = 'http://localhost:8080';

const localFallback: Record<string, string> = {
  'Dune Part Two': '/assets/poster-dune.jpg',
  'Interstellar': '/assets/poster-interstellar.jpg',
  'The Batman': '/assets/poster-batman.jpg',
  'Inception': '/assets/poster-inception.jpg',
};

export function resolveBackendUrl(url: string): string {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

export function getMoviePoster(movie: MovieResponse): string {
  if (movie.posterUrl && movie.posterUrl !== 'blank' && movie.posterUrl.trim() !== '') {
    return resolveBackendUrl(movie.posterUrl);
  }
  return localFallback[movie.title] || '/assets/poster-dune.jpg';
}

export function getTrailerUrl(movie: MovieResponse): string | null {
  if (movie.trailerUrl && movie.trailerUrl !== 'blank' && movie.trailerUrl.trim() !== '') {
    return resolveBackendUrl(movie.trailerUrl);
  }
  return null;
}

export function getMovieSynopsis(title: string): string {
  const map: Record<string, string> = {
    'Dune Part Two': 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    'Interstellar': "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    'The Batman': 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
    'Inception': 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
  };
  return map[title] || '';
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}min`;
}

interface MovieCardProps {
  movie: MovieResponse;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const poster = getMoviePoster(movie);

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer"
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: `opacity 0.7s cubic-bezier(0.33, 1, 0.68, 1) ${index * 0.1}s, transform 0.7s cubic-bezier(0.33, 1, 0.68, 1) ${index * 0.1}s`,
      }}
      onClick={() => navigate(`/movies/${movie.id}`)}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            const fallback = localFallback[movie.title] || '/assets/poster-dune.jpg';
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/movies/${movie.id}`);
            }}
            className="bg-[#E50914] hover:bg-[#b20710] text-white text-sm font-semibold px-5 py-2.5 rounded-sm translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-white font-semibold text-base truncate">{movie.title}</h3>
        <span className="inline-block mt-1.5 bg-white/[0.08] text-[#A3A3A3] text-xs px-2.5 py-1 rounded-full">
          {formatDuration(movie.duration)}
        </span>
      </div>
    </div>
  );
}
