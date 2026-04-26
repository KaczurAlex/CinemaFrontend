import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '@/hooks/useApi';
import { useShowtimes } from '@/hooks/useApi';
import CinematicSpotlight from './CinematicSpotlight';
import MovieCard, { formatDuration } from './MovieCard';
import { ChevronRight, Calendar, MapPin, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <CinematicSpotlight />
      <main className="relative z-[1]">
        <HeroSection />
        <NowPlayingSection />
        <FeaturedAtmosphereSection />
        <ShowtimesPreviewSection />
      </main>
    </>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center text-center"
      style={{ height: '100vh', cursor: 'none' }}
    >
      <h1
        className="font-extrabold uppercase text-white tracking-[-0.02em]"
        style={{
          fontSize: 'clamp(3rem, 8vw, 8rem)',
          textShadow: '0 2px 40px rgba(0,0,0,0.6)',
          animation: 'fadeInUp 1s cubic-bezier(0.33, 1, 0.68, 1) 0.3s both',
        }}
      >
        CINEMA WITHOUT LIMITS
      </h1>
      <p
        className="text-[#A3A3A3] mt-4 text-lg"
        style={{ animation: 'fadeInUp 1s cubic-bezier(0.33, 1, 0.68, 1) 0.5s both' }}
      >
        Book tickets for the latest blockbusters in premium theaters
      </p>
      <button
        onClick={() => {
          const el = document.getElementById('now-playing');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="mt-8 bg-[#E50914] hover:bg-[#b20710] text-white px-10 py-3.5 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] pointer-events-auto"
        style={{ animation: 'fadeInUp 1s cubic-bezier(0.33, 1, 0.68, 1) 0.7s both' }}
      >
        Begin Experience
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

/* ─── Now Playing ─── */
function NowPlayingSection() {
  const { movies, loading } = useMovies();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="now-playing"
      ref={sectionRef}
      className="relative bg-[#050505] py-28 px-5 lg:px-8"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-white text-4xl font-bold tracking-[-0.02em]">
            Now Playing
          </h2>
          <button
            onClick={() => navigate('/movies')}
            className="text-sm text-[#E50914] hover:text-white transition-colors flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
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
            {movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Featured Atmosphere ─── */
function FeaturedAtmosphereSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('.lens-card').forEach((card) => {
            (card as HTMLElement).style.opacity = '1';
            (card as HTMLElement).style.transform = 'scale(1)';
          });
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    { name: 'IMAX', desc: 'Crystal Clear Giant Screen' },
    { name: '4DX', desc: 'Motion, Wind, Rain & Scent' },
    { name: 'DOLBY ATMOS', desc: 'Immersive 360\u00b0 Sound' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] overflow-hidden"
    >
      {/* Background image */}
      <img
        src="/assets/theater-interior.jpg"
        alt="Theater interior"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/80" />

      {/* Content */}
      <div className="relative z-10 px-5 lg:px-8 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-12">
            <h2 className="text-white text-3xl font-bold">Premium Experiences</h2>
            <p className="text-[#A3A3A3] mt-2">Discover our world-class theater technologies</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {features.map((f, i) => (
              <div
                key={f.name}
                className="lens-card backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl px-10 py-12 text-center transition-all duration-700 hover:bg-white/[0.06] hover:border-white/[0.15] hover:scale-105"
                style={{
                  opacity: 0,
                  transform: 'scale(0.8)',
                  transitionDelay: `${i * 0.2}s`,
                }}
              >
                <h3 className="text-white text-2xl font-bold tracking-wide">{f.name}</h3>
                <p className="text-[#A3A3A3] text-sm mt-3">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Showtimes Preview ─── */
function ShowtimesPreviewSection() {
  const { showtimes, loading } = useShowtimes();
  const { movies } = useMovies();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('.showtime-card').forEach((card) => {
            (card as HTMLElement).style.opacity = '1';
            (card as HTMLElement).style.transform = 'translateX(0)';
          });
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showtimes]);

  // Scroll-driven 3D text effect (simplified)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
      const letters = el.querySelectorAll('.depth-letter');
      letters.forEach((letter, i) => {
        const offset = (i - letters.length / 2) * progress * 20;
        (letter as HTMLElement).style.transform = `translateX(${offset}px) translateZ(${progress * 50}px)`;
        (letter as HTMLElement).style.opacity = `${0.3 + progress * 0.7}`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const getMovieDuration = (movieId: number) => {
    const movie = movies.find(m => m.id === movieId);
    return movie ? movie.duration : 0;
  };

  return (
    <section className="bg-[#050505] py-24 overflow-hidden">
      {/* 3D Depth Header */}
      <div
        ref={headerRef}
        className="text-center mb-12 px-5"
        style={{ perspective: '600px' }}
      >
        <h2 className="text-white text-5xl md:text-7xl font-extrabold tracking-[-0.02em] inline-flex">
          {'NOW SHOWING'.split('').map((char, i) => (
            <span
              key={i}
              className="depth-letter inline-block transition-all duration-100"
              style={{
                transform: 'translateX(0) translateZ(0)',
                opacity: 0.3,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>

      {/* Horizontal scrollable showtimes */}
      <div ref={sectionRef} className="overflow-x-auto pb-4">
        <div className="flex gap-4 px-5 lg:px-8" style={{ minWidth: 'max-content' }}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="w-[280px] h-[180px] bg-white/5 rounded-lg animate-pulse flex-shrink-0" />
            ))
          ) : (
            showtimes.map((st, i) => (
              <div
                key={st.id}
                className="showtime-card w-[280px] flex-shrink-0 bg-[#111111] rounded-lg p-5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                style={{
                  opacity: 0,
                  transform: 'translateX(40px)',
                  transition: `opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${i * 0.08}s, transform 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${i * 0.08}s`,
                }}
              >
                <h3 className="text-white font-semibold text-lg truncate">{st.movieTitle}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[#A3A3A3] text-xs">
                  <MapPin className="w-3 h-3" />
                  {st.theaterName}
                </div>
                <div className="text-white text-2xl font-bold mt-3">{formatTime(st.showStartTime)}</div>
                <div className="flex items-center gap-1.5 mt-1 text-[#A3A3A3] text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatDate(st.showStartTime)}
                </div>
                {getMovieDuration(st.movieId) > 0 && (
                  <div className="flex items-center gap-1.5 mt-1 text-[#A3A3A3] text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDuration(getMovieDuration(st.movieId))}
                  </div>
                )}
                <button
                  onClick={() => navigate('/showtimes')}
                  className="w-full mt-4 bg-[#E50914] hover:bg-[#b20710] text-white py-2.5 rounded-sm font-semibold text-sm transition-colors"
                >
                  Book
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
