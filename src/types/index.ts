export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export type TravelStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'FAMILY';

export interface Travel {
  id: string;
  startDate: string;
  endDate: string;
  destination: string;
  description?: string;
  status: TravelStatus;
  userId: string;
  createdAt: string;
  bookings?: Booking[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  description?: string;
  address: string;
  rating?: number;
  amenities: string[];
  rooms?: Room[];
}

export interface Room {
  id: string;
  roomType: RoomType;
  pricePerNight: number;
  capacity: number;
  available: boolean;
  description?: string;
  hotelId: string;
  hotel?: Hotel;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  guestsCount: number;
  status: BookingStatus;
  specialRequests?: string;
  userId: string;
  hotelId: string;
  roomId: string;
  travelId?: string;
  hotel?: Hotel;
  room?: Room;
  travel?: Travel;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingReport {
  totalBookings: number;
  totalSpent: number;
  byStatus: Record<BookingStatus, number>;
  bookings: Booking[];
}