import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type {
  MovieResponse, TheaterResponse, ShowtimeResponse,
  SeatAvailabilityResponse, BookingResponse,
  CreateMovieRequest, CreateTheaterRequest, CreateShowtimeRequest,
} from '@/types/api';

const API_BASE = 'http://localhost:8080/cinema';

export function useMovies() {
  const { apiFetch } = useAuth();
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/public/list/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      } else {
        setError('Failed to load movies');
      }
    } catch {
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return { movies, loading, error, refetch: fetchMovies };
}

export function useTheaters() {
  const { apiFetch } = useAuth();
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTheaters = useCallback(async () => {
    try {
      const res = await apiFetch('/public/list/theaters');
      if (res.ok) {
        const data = await res.json();
        setTheaters(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  return { theaters, loading, refetch: fetchTheaters };
}

export function useShowtimes() {
  const { apiFetch } = useAuth();
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShowtimes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/public/list/showtimes');
      if (res.ok) {
        const data = await res.json();
        setShowtimes(data);
      } else {
        setError('Failed to load showtimes');
      }
    } catch {
      setError('Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  return { showtimes, loading, error, refetch: fetchShowtimes };
}

export function useSeatAvailability(showtimeId: number | null) {
  const { apiFetch } = useAuth();
  const [seats, setSeats] = useState<SeatAvailabilityResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSeats = useCallback(async () => {
    if (!showtimeId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/showtimes/${showtimeId}/seats`);
      if (res.ok) {
        const data = await res.json();
        setSeats(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [showtimeId, apiFetch]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  return { seats, loading, refetch: fetchSeats };
}

export function useBookings() {
  const { apiFetch, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch('/booking/me');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, apiFetch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (showtimeId: number, seatIds: number[]) => {
    const res = await apiFetch('/booking', {
      method: 'POST',
      body: JSON.stringify({ showtimeId, seatIds }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Booking failed');
    }
    await fetchBookings();
  }, [apiFetch, fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: number) => {
    const res = await apiFetch(`/booking/${bookingId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Cancel failed');
    }
    await fetchBookings();
  }, [apiFetch, fetchBookings]);

  return { bookings, loading, refetch: fetchBookings, createBooking, cancelBooking };
}

// ─── Admin Hooks ───

export function useAdminMovies() {
  const { apiFetch } = useAuth();
  const { movies, loading, refetch } = useMovies();

  const createMovie = useCallback(async (data: CreateMovieRequest) => {
    const res = await apiFetch('/admin/create/movie', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create movie');
    }
    await refetch();
  }, [apiFetch, refetch]);

  const deleteMovie = useCallback(async (id: number) => {
    const res = await apiFetch(`/admin/delete/movie/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete movie');
    }
    await refetch();
  }, [apiFetch, refetch]);

  const uploadPoster = useCallback(async (movieId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE}/admin/upload/movie/${movieId}/poster`;
    const token = localStorage.getItem('cinema_token');
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload failed');
    }
    await refetch();
  }, [refetch]);

  const uploadTrailer = useCallback(async (movieId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${API_BASE}/admin/upload/movie/${movieId}/trailer`;
    const token = localStorage.getItem('cinema_token');
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload failed');
    }
    await refetch();
  }, [refetch]);

  return { movies, loading, createMovie, deleteMovie, uploadPoster, uploadTrailer };
}

export function useAdminTheaters() {
  const { apiFetch } = useAuth();
  const { theaters, loading, refetch } = useTheaters();

  const createTheater = useCallback(async (data: CreateTheaterRequest) => {
    const res = await apiFetch('/admin/create/theater', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create theater');
    }
    await refetch();
  }, [apiFetch, refetch]);

  const deleteTheater = useCallback(async (id: number) => {
    const res = await apiFetch(`/admin/delete/theater/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete theater');
    }
    await refetch();
  }, [apiFetch, refetch]);

  return { theaters, loading, createTheater, deleteTheater };
}

export function useAdminShowtimes() {
  const { apiFetch } = useAuth();
  const { showtimes, loading, refetch } = useShowtimes();

  const createShowtime = useCallback(async (data: CreateShowtimeRequest) => {
    const res = await apiFetch('/admin/create/showtime', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create showtime');
    }
    await refetch();
  }, [apiFetch, refetch]);

  const deleteShowtime = useCallback(async (id: number) => {
    const res = await apiFetch(`/admin/delete/showtime/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete showtime');
    }
    await refetch();
  }, [apiFetch, refetch]);

  return { showtimes, loading, createShowtime, deleteShowtime };
}

export function useAllBookings() {
  const { apiFetch, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch('/public/list/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, apiFetch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refetch: fetchBookings };
}

export function useAdminUsers() {
  const { apiFetch } = useAuth();

  const forceDeleteUser = useCallback(async (userId: number) => {
    const res = await apiFetch(`/admin/delete/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to delete user');
    }
  }, [apiFetch]);

  return { forceDeleteUser };
}
