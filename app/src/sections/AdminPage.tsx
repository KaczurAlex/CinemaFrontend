import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useAdminMovies,
  useAdminTheaters,
  useAdminShowtimes,
  useAllBookings,
  useAdminUsers,
  useMovies,
  useTheaters,
  useShowtimes,
} from '@/hooks/useApi';
import {
  Film, Building2, Calendar, Ticket, Users, Shield,
  Plus, Trash2, X, AlertTriangle, Upload, Play,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CreateMovieRequest, CreateTheaterRequest, CreateShowtimeRequest, MovieResponse } from '@/types/api';
import { getMoviePoster } from './MovieCard';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'theaters', label: 'Theaters', icon: Building2 },
  { id: 'showtimes', label: 'Showtimes', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: Ticket },
  { id: 'users', label: 'Users', icon: Users },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#E50914] mx-auto mb-4" />
          <h1 className="text-white text-xl font-bold">Admin Access Required</h1>
          <p className="text-[#A3A3A3] mt-2">Please sign in to access the admin panel.</p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 bg-[#E50914] hover:bg-[#b20710] text-white px-6 py-2.5 rounded-sm font-semibold transition-colors"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-white text-xl font-bold">Access Denied</h1>
          <p className="text-[#A3A3A3] mt-2">You do not have admin or staff privileges.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 border border-white/20 hover:border-white text-white px-6 py-2.5 rounded-sm font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-24 pb-28">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-7 h-7 text-[#E50914]" />
          <h1 className="text-white text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#111111] text-[#A3A3A3] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-lg p-6 md:p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'movies' && <MoviesTab />}
          {activeTab === 'theaters' && <TheatersTab />}
          {activeTab === 'showtimes' && <ShowtimesTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </div>
    </main>
  );
}

/* ─── Dashboard ─── */
function DashboardTab() {
  const { movies, loading: mLoading } = useMovies();
  const { theaters, loading: tLoading } = useTheaters();
  const { showtimes, loading: sLoading } = useShowtimes();
  const { bookings, loading: bLoading } = useAllBookings();

  const stats = [
    { label: 'Movies', value: movies.length, loading: mLoading },
    { label: 'Theaters', value: theaters.length, loading: tLoading },
    { label: 'Showtimes', value: showtimes.length, loading: sLoading },
    { label: 'Bookings', value: bookings.length, loading: bLoading },
  ];

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#050505] border border-white/[0.06] rounded-lg p-6">
            <div className="text-[#A3A3A3] text-sm mb-1">{s.label}</div>
            <div className="text-white text-3xl font-bold">
              {s.loading ? (
                <div className="w-8 h-6 bg-white/10 rounded animate-pulse" />
              ) : (
                s.value
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Movies Tab ─── */
function MoviesTab() {
  const { movies, loading, createMovie, deleteMovie, uploadPoster, uploadTrailer } = useAdminMovies();
  const [form, setForm] = useState<CreateMovieRequest>({ title: '', duration: 0, posterUrl: '', trailerUrl: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPosterFor, setUploadingPosterFor] = useState<number | null>(null);
  const [uploadingTrailerFor, setUploadingTrailerFor] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.duration <= 0) return;
    try {
      setSubmitting(true);
      const payload: CreateMovieRequest = {
        title: form.title,
        duration: form.duration,
      };
      if (form.posterUrl?.trim()) payload.posterUrl = form.posterUrl.trim();
      if (form.trailerUrl?.trim()) payload.trailerUrl = form.trailerUrl.trim();
      await createMovie(payload);
      toast.success('Movie created');
      setIsAdding(false);
      setForm({ title: '', duration: 0, posterUrl: '', trailerUrl: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await deleteMovie(id);
      toast.success('Movie deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePosterUpload = async (movieId: number, file: File) => {
    try {
      setUploadingPosterFor(movieId);
      await uploadPoster(movieId, file);
      toast.success('Poster uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingPosterFor(null);
    }
  };

  const handleTrailerUpload = async (movieId: number, file: File) => {
    try {
      setUploadingTrailerFor(movieId);
      await uploadTrailer(movieId, file);
      toast.success('Trailer uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingTrailerFor(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Movies</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b20710] text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Movie
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">New Movie</h3>
            <button onClick={() => setIsAdding(false)} type="button" className="text-[#A3A3A3] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Duration (minutes) *</label>
              <input
                type="number"
                value={form.duration || ''}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                required
                min={1}
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Poster URL (optional)</label>
              <input
                type="url"
                value={form.posterUrl}
                onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Trailer URL (optional)</label>
              <input
                type="url"
                value={form.trailerUrl}
                onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-[#E50914] hover:bg-[#b20710] disabled:opacity-50 text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Movie'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {movies.map((m) => (
            <MovieAdminRow
              key={m.id}
              movie={m}
              onDelete={() => handleDelete(m.id)}
              onPosterUpload={(f) => handlePosterUpload(m.id, f)}
              onTrailerUpload={(f) => handleTrailerUpload(m.id, f)}
              uploadingPoster={uploadingPosterFor === m.id}
              uploadingTrailer={uploadingTrailerFor === m.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MovieAdminRow({
  movie,
  onDelete,
  onPosterUpload,
  onTrailerUpload,
  uploadingPoster,
  uploadingTrailer,
}: {
  movie: MovieResponse;
  onDelete: () => void;
  onPosterUpload: (f: File) => void;
  onTrailerUpload: (f: File) => void;
  uploadingPoster: boolean;
  uploadingTrailer: boolean;
}) {
  const poster = getMoviePoster(movie);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#050505] border border-white/[0.06] rounded-lg hover:border-white/[0.12] transition-colors">
      <img
        src={poster}
        alt={movie.title}
        className="w-12 h-[72px] object-cover rounded-sm flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{movie.title}</div>
        <div className="text-[#A3A3A3] text-sm">{movie.duration} min</div>
        {movie.posterUrl && movie.posterUrl !== 'blank' && (
          <div className="text-[#555555] text-xs truncate mt-0.5">{movie.posterUrl}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Poster upload */}
        <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${uploadingPoster ? 'bg-white/5 text-[#A3A3A3]' : 'bg-white/[0.06] text-[#A3A3A3] hover:text-white hover:bg-white/10'}`}>
          {uploadingPoster ? (
            <div className="w-3 h-3 border border-[#A3A3A3] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          Poster
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPosterUpload(f);
              e.target.value = '';
            }}
          />
        </label>

        {/* Trailer upload */}
        <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${uploadingTrailer ? 'bg-white/5 text-[#A3A3A3]' : 'bg-white/[0.06] text-[#A3A3A3] hover:text-white hover:bg-white/10'}`}>
          {uploadingTrailer ? (
            <div className="w-3 h-3 border border-[#A3A3A3] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          Trailer
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onTrailerUpload(f);
              e.target.value = '';
            }}
          />
        </label>

        <button
          onClick={onDelete}
          className="p-1.5 text-[#A3A3A3] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Theaters Tab ─── */
function TheatersTab() {
  const { theaters, loading, createTheater, deleteTheater } = useAdminTheaters();
  const [form, setForm] = useState<CreateTheaterRequest>({ name: '', size: 'SMALL' });
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      setSubmitting(true);
      await createTheater(form);
      toast.success('Theater created');
      setIsAdding(false);
      setForm({ name: '', size: 'SMALL' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this theater?')) return;
    try {
      await deleteTheater(id);
      toast.success('Theater deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Theaters</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b20710] text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Theater
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">New Theater</h3>
            <button onClick={() => setIsAdding(false)} type="button" className="text-[#A3A3A3] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Size</label>
              <select
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value as 'SMALL' | 'LARGE' })}
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              >
                <option value="SMALL">SMALL (80 seats)</option>
                <option value="LARGE">LARGE (240 seats)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-[#E50914] hover:bg-[#b20710] disabled:opacity-50 text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Theater'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">ID</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Name</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Size</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Seats</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {theaters.map((t) => (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-sm text-[#555555]">{t.id}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{t.name}</td>
                  <td className="py-3 px-4 text-sm text-[#A3A3A3]">{t.size}</td>
                  <td className="py-3 px-4 text-sm text-[#A3A3A3]">{t.size === 'SMALL' ? 80 : 240}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-[#A3A3A3] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Showtimes Tab ─── */
function ShowtimesTab() {
  const { showtimes, loading, createShowtime, deleteShowtime } = useAdminShowtimes();
  const { movies } = useMovies();
  const { theaters } = useTheaters();

  const [form, setForm] = useState<CreateShowtimeRequest>({ movieId: 0, theaterId: 0, showStartTime: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.movieId || !form.theaterId || !form.showStartTime) return;
    try {
      setSubmitting(true);
      const iso = new Date(form.showStartTime).toISOString();
      await createShowtime({ ...form, showStartTime: iso });
      toast.success('Showtime created');
      setIsAdding(false);
      setForm({ movieId: 0, theaterId: 0, showStartTime: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this showtime?')) return;
    try {
      await deleteShowtime(id);
      toast.success('Showtime deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Showtimes</h2>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              if (movies[0]) setForm((f) => ({ ...f, movieId: movies[0].id }));
              if (theaters[0]) setForm((f) => ({ ...f, theaterId: theaters[0].id }));
            }}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b20710] text-white px-4 py-2 rounded-sm text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Showtime
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">New Showtime</h3>
            <button onClick={() => setIsAdding(false)} type="button" className="text-[#A3A3A3] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Movie *</label>
              <select
                value={form.movieId || ''}
                onChange={(e) => setForm({ ...form, movieId: Number(e.target.value) })}
                required
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              >
                <option value="" disabled>Select movie</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Theater *</label>
              <select
                value={form.theaterId || ''}
                onChange={(e) => setForm({ ...form, theaterId: Number(e.target.value) })}
                required
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
              >
                <option value="" disabled>Select theater</option>
                {theaters.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A3A3A3] mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                value={form.showStartTime}
                onChange={(e) => setForm({ ...form, showStartTime: e.target.value })}
                required
                className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-[#E50914] hover:bg-[#b20710] disabled:opacity-50 text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Showtime'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">ID</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Movie</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Theater</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Start Time</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((st) => (
                <tr key={st.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-sm text-[#555555]">{st.id}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{st.movieTitle}</td>
                  <td className="py-3 px-4 text-sm text-[#A3A3A3]">{st.theaterName}</td>
                  <td className="py-3 px-4 text-sm text-[#A3A3A3]">{formatTime(st.showStartTime)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="p-1.5 text-[#A3A3A3] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Bookings Tab ─── */
function BookingsTab() {
  const { bookings, loading } = useAllBookings();
  const { showtimes } = useShowtimes();

  const getShowtimeInfo = (showtimeId: number) => {
    return showtimes.find((s) => s.id === showtimeId);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/15 text-yellow-500';
      case 'CONFIRMED': return 'bg-green-500/15 text-green-500';
      case 'CANCELLED': return 'bg-red-500/15 text-red-500';
      case 'EXPIRED': return 'bg-gray-500/15 text-gray-500';
      default: return 'bg-gray-500/15 text-gray-500';
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-6">All Bookings</h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-[#A3A3A3] text-center py-8">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">ID</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Showtime</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Seat</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-xs text-[#A3A3A3] font-semibold uppercase tracking-wider py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const st = getShowtimeInfo(b.showtimeId);
                return (
                  <tr key={b.bookingId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#555555]">#{b.bookingId}</td>
                    <td className="py-3 px-4 text-sm text-white">
                      {st ? `${st.movieTitle} @ ${st.theaterName}` : `Showtime #${b.showtimeId}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A3A3A3]">Seat {b.seatId}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#A3A3A3]">{formatDate(b.created)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab() {
  const { forceDeleteUser } = useAdminUsers();
  const [userId, setUserId] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !confirm(`Force delete user #${userId}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      await forceDeleteUser(Number(userId));
      toast.success(`User #${userId} deleted`);
      setUserId('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="text-white text-xl font-bold mb-6">User Management</h2>

      <div className="p-6 bg-white/[0.03] rounded-lg border border-white/[0.06] max-w-[500px]">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="text-white font-semibold">Force Delete User</h3>
        </div>
        <p className="text-[#A3A3A3] text-sm mb-4">
          Enter a user ID to permanently delete their account. This action cannot be undone.
        </p>
        <form onSubmit={handleDelete} className="flex gap-3">
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            required
            min={1}
            className="flex-1 bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none"
          />
          <button
            type="submit"
            disabled={deleting}
            className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-400/30 px-5 py-2.5 rounded-sm font-semibold text-sm transition-colors flex items-center gap-2"
          >
            {deleting ? 'Deleting...' : <><Trash2 className="w-4 h-4" /> Delete</>}
          </button>
        </form>
      </div>
    </div>
  );
}
