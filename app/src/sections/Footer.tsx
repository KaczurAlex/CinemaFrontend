import { Link } from 'react-router-dom';
import { Film, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Logo & Tagline */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Film className="w-5 h-5 text-[#E50914]" />
              <span className="text-lg font-extrabold tracking-[0.05em] text-white">
                CINEVAULT
              </span>
            </Link>
            <p className="text-sm text-[#A3A3A3]">Your premium cinema experience</p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <Link to="/movies" className="block text-sm text-[#A3A3A3] hover:text-white transition-colors">
              Movies
            </Link>
            <Link to="/showtimes" className="block text-sm text-[#A3A3A3] hover:text-white transition-colors">
              Showtimes
            </Link>
            <Link to="/profile" className="block text-sm text-[#A3A3A3] hover:text-white transition-colors">
              My Bookings
            </Link>
            <Link to="/profile" className="block text-sm text-[#A3A3A3] hover:text-white transition-colors">
              Profile
            </Link>
          </div>

          {/* Social & Copyright */}
          <div>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-[#A3A3A3] hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-[#555555]">
              &copy; {new Date().getFullYear()} CineVault. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
