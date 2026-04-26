import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBookings, useShowtimes } from '@/hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Ticket, CheckCircle, Clock, XCircle, AlertTriangle, ChevronDown, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <ProfileScreen />;
}

/* ─── Auth Screen (Login/Register) ─── */
function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div
        className="w-full max-w-[420px] bg-[#111111] border border-white/[0.06] rounded-lg p-10 md:p-12"
        style={{ animation: 'modalIn 0.3s ease-out both' }}
      >
        {mode === 'login' ? (
          <LoginForm onSwitch={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitch={() => setMode('login')} />
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </main>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await login({ usernameOrEmail, password });
      toast.success('Welcome back!');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-white text-2xl font-bold text-center">Welcome Back</h2>
      <p className="text-[#A3A3A3] text-sm text-center mt-2">Sign in to book tickets and manage your reservations</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Username or Email</label>
          <input
            type="text"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            placeholder="Enter username or email"
            required
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            minLength={8}
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>

        {error && <p className="text-[#E50914] text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E50914] hover:bg-[#b20710] disabled:opacity-70 text-white py-3.5 rounded-sm font-bold text-base transition-colors flex items-center justify-center"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-[#A3A3A3] text-center mt-5">
        Don&apos;t have an account?{' '}
        <button onClick={onSwitch} className="text-[#E50914] hover:text-white transition-colors">Register</button>
      </p>
    </>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await register({ username, password, email, fullName });
      toast.success('Account created! Signing you in...');
      await login({ usernameOrEmail: username, password });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-white text-2xl font-bold text-center">Create Account</h2>
      <p className="text-[#A3A3A3] text-sm text-center mt-2">Join CineVault to start booking tickets</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#A3A3A3] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-3 text-white text-[0.9375rem] placeholder:text-[#555555] focus:border-[#E50914] focus:outline-none transition-colors"
          />
        </div>

        {error && <p className="text-[#E50914] text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E50914] hover:bg-[#b20710] disabled:opacity-70 text-white py-3.5 rounded-sm font-bold text-base transition-colors flex items-center justify-center mt-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-[#A3A3A3] text-center mt-5">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-[#E50914] hover:text-white transition-colors">Sign In</button>
      </p>
    </>
  );
}

/* ─── Profile Screen (authenticated) ─── */
function ProfileScreen() {
  const { user, logout, apiFetch } = useAuth();
  const { bookings, loading: bookingsLoading, cancelBooking } = useBookings();
  const { showtimes } = useShowtimes();
  const navigate = useNavigate();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Stats
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'PENDING': return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default: return <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />;
    }
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

  const getShowtimeInfo = (showtimeId: number) => {
    const st = showtimes.find(s => s.id === showtimeId);
    return st || null;
  };

  const getSeatInfo = (booking: typeof bookings[0]) => {
    const st = getShowtimeInfo(booking.showtimeId);
    if (!st) return null;
    return { movieTitle: st.movieTitle, theaterName: st.theaterName };
  };

  const formatBookingDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const res = await apiFetch('/user/delete/me', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted');
        logout();
      } else {
        toast.error('Failed to delete account');
      }
    } catch {
      toast.error('Failed to delete account');
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-24 pb-28">
      {/* Profile Header */}
      <div className="px-5 lg:px-8 py-12" style={{ background: 'linear-gradient(180deg, rgba(229, 9, 20, 0.06) 0%, #050505 100%)' }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Welcome, {user?.fullName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-[#A3A3A3] text-sm">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </span>
              <span className="bg-[#E50914]/15 text-[#E50914] text-xs font-semibold px-3 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-[#111111] border border-white/[0.06] rounded-lg px-6 py-4 min-w-[120px]">
              <div className="text-white text-2xl font-bold">{totalBookings}</div>
              <div className="text-xs text-[#A3A3A3] mt-1">Bookings</div>
            </div>
            <div className="bg-[#111111] border border-white/[0.06] rounded-lg px-6 py-4 min-w-[120px]">
              <div className="text-green-500 text-2xl font-bold">{confirmedCount}</div>
              <div className="text-xs text-[#A3A3A3] mt-1">Confirmed</div>
            </div>
            <div className="bg-[#111111] border border-white/[0.06] rounded-lg px-6 py-4 min-w-[120px]">
              <div className="text-yellow-500 text-2xl font-bold">{pendingCount}</div>
              <div className="text-xs text-[#A3A3A3] mt-1">Pending</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 mt-10">
        {/* My Bookings */}
        <h2 className="text-white text-xl font-bold mb-6">My Bookings</h2>

        {bookingsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[100px] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-[#555555] mx-auto mb-4" />
            <p className="text-white">No bookings yet</p>
            <p className="text-[#A3A3A3] text-sm mt-1">Browse showtimes to book your first tickets!</p>
            <button
              onClick={() => navigate('/showtimes')}
              className="mt-4 bg-[#E50914] hover:bg-[#b20710] text-white px-6 py-2.5 rounded-sm font-semibold transition-colors"
            >
              Browse Showtimes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, i) => {
              const info = getSeatInfo(booking);
              return (
                <div
                  key={booking.bookingId}
                  className="bg-[#111111] border border-white/[0.06] rounded-lg px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${i * 0.06}s both`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#555555]">Booking #{booking.bookingId}</div>
                    <div className="text-white font-semibold mt-1">
                      {info ? `${info.movieTitle} — ${info.theaterName}` : `Showtime #${booking.showtimeId}`}
                    </div>
                    <div className="text-[#A3A3A3] text-sm mt-1">{formatBookingDate(booking.created)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancel(booking.bookingId)}
                        className="text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 px-3 py-1.5 rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Account Settings */}
        <div className="mt-12">
          <h2 className="text-white text-xl font-bold mb-6">Account Settings</h2>

          {/* Change Password */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => setExpandedSection(expandedSection === 'password' ? null : 'password')}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white font-semibold text-sm">Change Password</span>
              <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform ${expandedSection === 'password' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'password' && <ChangePasswordForm />}
          </div>

          {/* Change Username */}
          <div className="bg-[#111111] border border-white/[0.06] rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => setExpandedSection(expandedSection === 'username' ? null : 'username')}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white font-semibold text-sm">Change Username</span>
              <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform ${expandedSection === 'username' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'username' && <ChangeUsernameForm />}
          </div>

          {/* Delete Account */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 text-red-400 border border-red-400/30 hover:bg-red-400/10 px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function ChangePasswordForm() {
  const { apiFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch('/user/change-password/me', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success('Password updated');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update password');
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-white/[0.06] pt-4">
      <div>
        <label className="block text-xs text-[#A3A3A3] mb-1.5">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-[#A3A3A3] mb-1.5">New Password (min 8 characters)</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#E50914] hover:bg-[#b20710] disabled:opacity-70 text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

function ChangeUsernameForm() {
  const { apiFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch('/user/change-username/me', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newUsername }),
      });
      if (res.ok) {
        toast.success('Username updated');
        setCurrentPassword('');
        setNewUsername('');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update username');
      }
    } catch {
      toast.error('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-white/[0.06] pt-4">
      <div>
        <label className="block text-xs text-[#A3A3A3] mb-1.5">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-[#A3A3A3] mb-1.5">New Username</label>
        <input
          type="text"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          required
          className="w-full bg-[#050505] border border-white/[0.1] rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#E50914] focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-[#E50914] hover:bg-[#b20710] disabled:opacity-70 text-white px-6 py-2.5 rounded-sm font-semibold text-sm transition-colors"
      >
        {loading ? 'Updating...' : 'Update Username'}
      </button>
    </form>
  );
}
