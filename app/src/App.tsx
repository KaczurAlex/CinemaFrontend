import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './sections/Navbar';
import Footer from './sections/Footer';
import { Toaster } from '@/components/ui/sonner';

const HomePage = lazy(() => import('./sections/HomePage'));
const MoviesPage = lazy(() => import('./sections/MoviesPage'));
const MovieDetailPage = lazy(() => import('./sections/MovieDetailPage'));
const ShowtimesPage = lazy(() => import('./sections/ShowtimesPage'));
const ProfilePage = lazy(() => import('./sections/ProfilePage'));
const AdminPage = lazy(() => import('./sections/AdminPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/showtimes" element={<ShowtimesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
    </div>
  );
}
