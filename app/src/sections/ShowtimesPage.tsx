import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovies, useTheaters, useShowtimes, useSeatAvailability, useBookings } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { getMoviePoster } from './MovieCard';
import { MapPin, ChevronDown, ChevronUp, Armchair } from 'lucide-react';
import { toast } from 'sonner';

export default function ShowtimesPage() {
  const { showtimes, loading } = useShowtimes();
  const { movies } = useMovies();
  const { theaters } = useTheaters();

  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<number | null>(null);
  const [expandedShowtime, setExpandedShowtime] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return showtimes.filter((s) => {
      if (selectedMovie && s.movieId !== selectedMovie) return false;
      if (selectedTheater && s.theaterId !== selectedTheater) return false;
      return true;
    });
  }, [showtimes, selectedMovie, selectedTheater]);

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

  return (
    <main className="min-h-screen bg-[#050505] pt-24 pb-28">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <h1
          className="text-white font-extrabold tracking-[-0.02em] mb-10"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Showtimes
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-[280px] flex-shrink-0">
            <div className="bg-[#111111] rounded-lg p-6 lg:sticky lg:top-24">
              <h3 className="text-white font-semibold mb-4">Filter by Movie</h3>
              <div className="space-y-2 mb-6 max-h-[240px] overflow-y-auto">
                {movies.map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      setSelectedMovie(selectedMovie === m.id ? null : m.id)
                    }
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-sm transition-colors ${
                      selectedMovie === m.id
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="w-8 h-12 bg-white/5 rounded-sm flex-shrink-0 overflow-hidden">
                      <img
                        src={getMoviePoster(m)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-sm truncate">{m.title}</span>
                    {selectedMovie === m.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E50914] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <h3 className="text-white font-semibold mb-4">Filter by Theater</h3>
              <div className="space-y-2">
                {theaters.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setSelectedTheater(
                        selectedTheater === t.id ? null : t.id
                      )
                    }
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-sm transition-colors ${
                      selectedTheater === t.id
                        ? 'text-white bg-white/[0.06]'
                        : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{t.name}</span>
                    {selectedTheater === t.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E50914] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {(selectedMovie || selectedTheater) && (
                <button
                  onClick={() => {
                    setSelectedMovie(null);
                    setSelectedTheater(null);
                  }}
                  className="mt-4 text-sm text-[#E50914] hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Showtimes List */}
          <div className="flex-1 space-y-3">
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[90px] bg-white/5 rounded-lg animate-pulse"
                  />
                ))}
              </>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#A3A3A3]">
                  No showtimes match your filters.
                </p>
              </div>
            ) : (
              filtered.map((st, i) => (
                <ShowtimeRow
                  key={st.id}
                  showtime={st}
                  index={i}
                  isExpanded={expandedShowtime === st.id}
                  onToggle={() =>
                    setExpandedShowtime(
                      expandedShowtime === st.id ? null : st.id
                    )
                  }
                  formatTime={formatTime}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Showtime Row with Inline Seat Map ─── */
function ShowtimeRow({
  showtime,
  index,
  isExpanded,
  onToggle,
  formatTime,
  formatDate,
}: {
  showtime: {
    id: number;
    movieId: number;
    movieTitle: string;
    theaterName: string;
    showStartTime: string;
  };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  formatTime: (iso: string) => string;
  formatDate: (iso: string) => string;
}) {
  return (
    <div
      className="bg-[#111111] border border-white/[0.06] rounded-lg overflow-hidden hover:border-white/[0.12] transition-colors"
      style={{
        animation: `slideInRight 0.5s cubic-bezier(0.33, 1, 0.68, 1) ${
          index * 0.05
        }s both`,
      }}
    >
      {/* Row Header */}
      <button
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">
            {showtime.movieTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-[#A3A3A3] text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {showtime.theaterName}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-white text-xl font-bold">
              {formatTime(showtime.showStartTime)}
            </div>
            <div className="text-[#A3A3A3] text-xs">
              {formatDate(showtime.showStartTime)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#A3A3A3]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
            )}
          </div>
        </div>
      </button>

      {/* Inline Seat Map */}
      {isExpanded && (
        <SeatMapInline showtimeId={showtime.id} />
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Inline Seat Map ─── */
function SeatMapInline({ showtimeId }: { showtimeId: number }) {
  const { seats } = useSeatAvailability(showtimeId);
  const { createBooking } = useBookings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [booking, setBooking] = useState(false);

  const rows = useMemo(() => {
    const map = new Map<number, typeof seats>();
    seats.forEach((s) => {
      const existing = map.get(s.row) || [];
      existing.push(s);
      map.set(s.row, existing);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [seats]);

  const toggleSeat = (seatId: number, status: string) => {
    if (status !== 'AVAILABLE') return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book seats');
      navigate('/profile');
      return;
    }
    if (selectedSeats.length === 0) return;
    try {
      setBooking(true);
      await createBooking(showtimeId, selectedSeats);
      toast.success('Booking confirmed!');
      setSelectedSeats([]);
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const getSeatStyle = (status: string, isSelected: boolean) => {
    if (isSelected)
      return 'bg-[#E50914] border-[#E50914] text-white';
    if (status === 'AVAILABLE')
      return 'bg-white/10 border-white/[0.08] text-[#A3A3A3] hover:bg-white/20 hover:text-white cursor-pointer';
    return 'bg-white/[0.03] border-white/[0.04] text-[#333333] cursor-not-allowed';
  };

  return (
    <div className="border-t border-white/[0.06] px-6 py-6">
      {/* Screen */}
      <div className="w-[70%] mx-auto mb-1">
        <div
          className="h-2 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </div>
      <p className="text-center text-[0.625rem] text-[#555555] tracking-[0.1em] mb-6">
        SCREEN
      </p>

      {/* Seat Grid */}
      {rows.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(([rowNum, rowSeats]) => (
            <div
              key={rowNum}
              className="flex items-center justify-center gap-1"
            >
              <span className="text-xs text-[#555555] w-5 text-center">
                {String.fromCharCode(64 + rowNum)}
              </span>
              <div className="flex gap-1">
                {rowSeats
                  .sort((a, b) => a.number - b.number)
                  .map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatId);
                    return (
                      <button
                        key={seat.seatId}
                        onClick={() =>
                          toggleSeat(seat.seatId, seat.status)
                        }
                        className={`w-7 h-7 rounded border text-[0.5rem] flex items-center justify-center transition-all duration-150 ${getSeatStyle(
                          seat.status,
                          isSelected
                        )}`}
                        title={`Row ${String.fromCharCode(
                          64 + seat.row
                        )} Seat ${seat.number}`}
                      >
                        <Armchair className="w-3 h-3" />
                      </button>
                    );
                  })}
              </div>
              <span className="text-xs text-[#555555] w-5 text-center">
                {String.fromCharCode(64 + rowNum)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-5">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-white/10 border border-white/[0.08]" />
          <span className="text-xs text-[#A3A3A3]">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-[#E50914] border border-[#E50914]" />
          <span className="text-xs text-[#A3A3A3]">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-white/[0.03] border border-white/[0.04]" />
          <span className="text-xs text-[#A3A3A3]">Occupied</span>
        </div>
      </div>

      {/* Selected Summary + Book Button */}
      {selectedSeats.length > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 p-3 bg-white/[0.03] rounded-lg">
            <p className="text-white text-sm">
              {selectedSeats.length} seat
              {selectedSeats.length > 1 ? 's' : ''} selected:{' '}
              <span className="text-[#E50914]">
                {selectedSeats
                  .map((id) => {
                    const seat = seats.find((s) => s.seatId === id);
                    return seat
                      ? `${String.fromCharCode(64 + seat.row)}${seat.number}`
                      : '';
                  })
                  .join(', ')}
              </span>
            </p>
          </div>
          <button
            onClick={handleBook}
            disabled={booking}
            className="bg-[#E50914] hover:bg-[#b20710] disabled:opacity-40 text-white px-8 py-3 rounded-sm font-bold text-sm transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            {booking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Book Seats'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
