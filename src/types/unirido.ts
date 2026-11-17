export type UserRole = 'rider' | 'driver' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type RideStatus =
  | 'pending'
  | 'assigned'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  usn: string;
  role: UserRole;
  collegeIdUrl: string;
  status: VerificationStatus;
  rating: number;
  ratingCount?: number;
  createdAt?: string;
}

export interface Driver extends User {
  role: 'driver';
  licenceUrl: string;
  rcUrl: string;
  insuranceUrl: string;
  bikeNumber: string;
  bikeModel: string;
  helmetConfirmed: boolean;
  availableTomorrow?: boolean;
  preferredRouteId?: string;
}

export type AnyUser = User | Driver;

export interface Route {
  id: string;
  name: string;
  origin: string;
  pickupPoints: string[];
  destination: 'REVA University';
  timeSlots: string[];
  basePrice: number;
  pricePerKm: number;
  distanceKm: number;
  seatsLeft: Record<string, number>;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId: string | null;
  routeId: string;
  date: string;
  timeSlot: string;
  pickupPoint: string;
  price: number;
  status: RideStatus;
  driverConfirmed?: boolean;
  rating: number | null;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  area: string;
  preferredTime: string;
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  rideId: string | null;
  userId: string;
  category: string;
  details: string;
  createdAt: string;
}

export type AppScreen =
  | 'landing'
  | 'auth'
  | 'verification'
  | 'rider-home'
  | 'book-ride'
  | 'my-rides'
  | 'driver-dashboard'
  | 'admin-dashboard'
  | 'profile';
