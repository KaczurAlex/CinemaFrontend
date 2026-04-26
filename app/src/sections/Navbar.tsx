import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Film, User, LogOut, Menu, X, Ticket, Shield } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-6 h-6 text-[#E50914] transition-transform group-hover:scale-110" />
          <span className="text-lg font-extrabold tracking-[0.05em] text-white">
            CINEVAULT
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/movies" className="text-sm text-[#A3A3A3] hover:text-white transition-colors">
            Movies
          </Link>
          <Link to="/showtimes" className="text-sm text-[#A3A3A3] hover:text-white transition-colors">
            Showtimes
          </Link>
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
            <Link
              to="/admin"
              className="text-sm text-[#E50914] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-sm text-[#A3A3A3] hover:text-white transition-colors flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {user?.fullName || 'Profile'}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-[#A3A3A3] hover:text-[#E50914] transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className="text-sm bg-[#E50914] hover:bg-[#b20710] text-white px-5 py-2 rounded-full font-semibold transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/[0.06] px-5 py-6 space-y-4">
          <Link to="/movies" className="block text-[#A3A3A3] hover:text-white py-2">Movies</Link>
          <Link to="/showtimes" className="block text-[#A3A3A3] hover:text-white py-2">Showtimes</Link>
          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
            <Link to="/admin" className="block text-[#E50914] hover:text-white py-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="block text-[#A3A3A3] hover:text-white py-2 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> My Bookings
              </Link>
              <button onClick={logout} className="block text-[#A3A3A3] hover:text-[#E50914] py-2">
                Logout
              </button>
            </>
          ) : (
            <Link to="/profile" className="block text-[#E50914] font-semibold py-2">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
