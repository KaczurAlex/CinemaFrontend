// API Types matching the Java backend DTOs

export interface MovieResponse {
  id: number;
  title: string;
  duration: number;
  posterUrl: string;
  trailerUrl: string;
}

export interface TheaterResponse {
  id: number;
  name: string;
  size: 'SMALL' | 'LARGE';
}

export interface ShowtimeResponse {
  id: number;
  movieId: number;
  movieTitle: string;
  theaterId: number;
  theaterName: string;
  showStartTime: string;
}

export interface SeatAvailabilityResponse {
  seatId: number;
  row: number;
  number: number;
  status: string;
}

export interface BookingResponse {
  bookingId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  created: string;
  showtimeId: number;
  seatId: number;
}

export interface UserProfileResponse {
  email: string;
  fullName: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export interface CreateBookingRequest {
  showtimeId: number;
  seatIds: number[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeUsernameRequest {
  currentPassword: string;
  newUsername: string;
}

export interface AuthResponse {
  token: string;
}

// ─── Admin Create Request Types ───

export interface CreateMovieRequest {
  title: string;
  duration: number;
  posterUrl?: string;
  trailerUrl?: string;
}

export interface CreateTheaterRequest {
  name: string;
  size: 'SMALL' | 'LARGE';
}

export interface CreateShowtimeRequest {
  movieId: number;
  theaterId: number;
  showStartTime: string;
}
