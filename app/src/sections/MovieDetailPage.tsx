import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies, useShowtimes } from '@/hooks/useApi';
import { getMoviePoster, getMovieSynopsis, getTrailerUrl, formatDuration } from './MovieCard';
import { Play, Ticket, MapPin, Clock, X } from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { movies, loading: moviesLoading } = useMovies();
  const { showtimes, loading: showtimesLoading } = useShowtimes();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const movie = movies.find(m => m.id === Number(id));
  const movieShowtimes = showtimes.filter(s => s.movieId === Number(id));

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (moviesLoading) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 px-5">
        <div className="max-w-[1400px] mx-auto text-center py-20">
          <h1 className="text-white text-2xl font-bold">Movie not found</h1>
          <button
            onClick={() => navigate('/movies')}
            className="mt-4 text-[#E50914] hover:text-white transition-colors"
          >
            Back to Movies
          </button>
        </div>
      </main>
    );
  }

  const poster = getMoviePoster(movie);
  const synopsis = getMovieSynopsis(movie.title);
  const trailerUrl = getTrailerUrl(movie);

  return (
    <main className="min-h-screen bg-[#050505]">
      {/* Hero Banner */}
      <section className="relative min-h-[60vh] overflow-hidden">
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-[60px] brightness-[0.3] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-8 py-20 flex flex-col md:flex-row gap-10 items-start">
          <div
            className="w-[200px] md:w-[300px] flex-shrink-0 rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ animation: 'slideInLeft 0.8s cubic-bezier(0.33, 1, 0.68, 1) both' }}
          >
            <img src={poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
          </div>

          <div
            className="flex-1"
            style={{ animation: 'slideInRight 0.8s cubic-bezier(0.33, 1, 0.68, 1) 0.2s both' }}
          >
            <h1 className="text-white font-extrabold tracking-[-0.02em]" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {movie.title}
            </h1>
            <span className="inline-block mt-3 bg-white/[0.08] text-[#A3A3A3] text-sm px-3.5 py-1.5 rounded-full">
              {formatDuration(movie.duration)}
            </span>
            <p className="text-[#A3A3A3] mt-5 text-base leading-relaxed max-w-[600px]">
              {synopsis}
            </p>
            <div className="flex gap-3 mt-7">
              <button
                onClick={() => {
                  if (trailerUrl) {
                    setTrailerOpen(true);
                  }
                }}
                disabled={!trailerUrl}
                className="flex items-center gap-2 border border-white/20 hover:border-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/20 text-white px-7 py-3 rounded-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4" /> Watch Trailer
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('available-showtimes');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b20710] text-white px-7 py-3 rounded-sm font-semibold transition-colors"
              >
                <Ticket className="w-4 h-4" /> Book Tickets
              </button>
            </div>
            {!trailerUrl && (
              <p className="text-[#555555] text-xs mt-2">No trailer available</p>
            )}
          </div>
        </div>
      </section>

      {/* Available Showtimes */}
      <section id="available-showtimes" className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 pb-28">
        <h2 className="text-white text-2xl font-bold mb-8">Available Showtimes</h2>

        {showtimesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[160px] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : movieShowtimes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#A3A3A3]">No showtimes available for this movie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {movieShowtimes.map((st, i) => (
              <div
                key={st.id}
                className="bg-[#111111] border border-white/[0.06] rounded-lg p-6 hover:border-white/[0.12] transition-colors"
                style={{
                  animation: `fadeInUp 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${i * 0.08}s both`,
                }}
              >
                <div className="flex items-center gap-1.5 text-[#A3A3A3] text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {st.theaterName}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-[#A3A3A3]" />
                  <span className="text-white text-2xl font-bold">{formatTime(st.showStartTime)}</span>
                </div>
                <div className="text-[#A3A3A3] text-sm mt-1">{formatDate(st.showStartTime)}</div>
                <button
                  onClick={() => navigate('/showtimes')}
                  className="w-full mt-4 bg-[#E50914] hover:bg-[#b20710] text-white py-3 rounded-sm font-semibold transition-colors"
                >
                  Select Seats
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trailer Modal */}
      {trailerOpen && trailerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-[900px] bg-[#111111] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-white font-semibold">{movie.title} - Trailer</h3>
              <button
                onClick={() => setTrailerOpen(false)}
                className="text-[#A3A3A3] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={trailerUrl}
                controls
                autoPlay
                className="w-full h-full"
                onError={() => setTrailerOpen(false)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
