import {
  AnyUser,
  Driver,
  Ride,
  Route,
  SafetyReport,
  User,
  UserRole,
  VerificationStatus,
  WaitlistEntry,
} from '../types/unirido';
import {
  createSeedRides,
  getTomorrowDateISO,
  PILOT_ROUTES,
  SEED_REPORTS,
  SEED_USERS,
  SEED_WAITLIST,
} from './mockData';

const STORAGE_KEY = 'unirido_pilot_state_v1';

export interface PilotStore {
  users: AnyUser[];
  routes: Route[];
  rides: Ride[];
  waitlist: WaitlistEntry[];
  reports: SafetyReport[];
  currentUserId: string | null;
}

export function isRevaEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
  return (
    normalized.endsWith('@reva.edu.in') ||
    normalized.endsWith('.reva.edu.in') ||
    normalized.endsWith('.edu.in')
  );
}

export function maskPhone(phone: string, reveal: boolean): string {
  if (reveal) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '+91 98*** **000';
  const lastThree = digits.slice(-3);
  return `+91 98*** **${lastThree}`;
}

export function formatRideDate(isoDate: string): string {
  const tomorrow = getTomorrowDateISO();
  if (isoDate === tomorrow) return 'Tomorrow';
  const today = new Date().toISOString().split('T')[0];
  if (isoDate === today) return 'Today';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function createInitialStore(): PilotStore {
  return {
    users: SEED_USERS,
    routes: PILOT_ROUTES,
    rides: createSeedRides(),
    waitlist: SEED_WAITLIST,
    reports: SEED_REPORTS,
    currentUserId: null,
  };
}

export function loadStore(): PilotStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialStore();
      saveStore(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as PilotStore;
    if (!parsed.users || !parsed.routes || !parsed.rides) {
      const initial = createInitialStore();
      saveStore(initial);
      return initial;
    }
    return parsed;
  } catch {
    return createInitialStore();
  }
}

export function saveStore(store: PilotStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors in restricted preview contexts
  }
}

export function resetPilotStore(): PilotStore {
  const fresh = createInitialStore();
  saveStore(fresh);
  return fresh;
}

// TODO: Replace with Firebase Auth `createUserWithEmailAndPassword` + Firestore `setDoc(doc(db, 'users', uid), ...)`
export function registerUser(
  store: PilotStore,
  input: {
    name: string;
    email: string;
    phone: string;
    usn: string;
    role: 'rider' | 'driver';
    password: string;
  }
): { ok: true; store: PilotStore; user: AnyUser } | { ok: false; error: string } {
  const cleanEmail = input.email.trim().toLowerCase();
  if (!isRevaEmail(cleanEmail)) {
    return {
      ok: false,
      error: 'Use your official REVA University email (.reva.edu.in or .edu.in).',
    };
  }
  if (input.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (!input.name.trim() || !input.phone.trim() || !input.usn.trim()) {
    return { ok: false, error: 'Fill in your full name, phone number, and USN.' };
  }
  const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      ok: false,
      error: 'An account with this REVA email already exists. Please log in.',
    };
  }

  const id = `${input.role}-${Date.now()}`;
  const baseUser: User = {
    id,
    name: input.name.trim(),
    email: cleanEmail,
    phone: input.phone.trim(),
    usn: input.usn.trim().toUpperCase(),
    role: input.role,
    collegeIdUrl: '',
    status: 'pending',
    rating: 5.0,
    ratingCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  const newUser: AnyUser =
    input.role === 'driver'
      ? ({
          ...baseUser,
          role: 'driver',
          licenceUrl: '',
          rcUrl: '',
          insuranceUrl: '',
          bikeNumber: '',
          bikeModel: '',
          helmetConfirmed: false,
          availableTomorrow: false,
          preferredRouteId: 'route-a',
        } as Driver)
      : baseUser;

  const nextStore: PilotStore = {
    ...store,
    users: [...store.users, newUser],
    currentUserId: newUser.id,
  };
  saveStore(nextStore);
  return { ok: true, store: nextStore, user: newUser };
}

// TODO: Replace with Firebase Auth `signInWithEmailAndPassword` + Firestore `getDoc`
export function loginUser(
  store: PilotStore,
  email: string,
  _password: string
): { ok: true; store: PilotStore; user: AnyUser } | { ok: false; error: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!isRevaEmail(cleanEmail)) {
    return {
      ok: false,
      error: 'Only REVA University emails (.reva.edu.in or .edu.in) can log in.',
    };
  }
  const found = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!found) {
    return {
      ok: false,
      error: 'No student account found for that email. Sign up first or use a Demo account.',
    };
  }
  const nextStore: PilotStore = { ...store, currentUserId: found.id };
  saveStore(nextStore);
  return { ok: true, store: nextStore, user: found };
}

export function switchSessionUser(store: PilotStore, userId: string | null): PilotStore {
  const nextStore: PilotStore = { ...store, currentUserId: userId };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firebase Storage upload + Firestore `updateDoc(doc(db, 'users', userId), ...)`
export function submitVerificationDocuments(
  store: PilotStore,
  userId: string,
  payload: {
    collegeIdUrl: string;
    licenceUrl?: string;
    rcUrl?: string;
    insuranceUrl?: string;
    bikeNumber?: string;
    bikeModel?: string;
    helmetConfirmed?: boolean;
    preferredRouteId?: string;
  }
): PilotStore {
  const nextUsers = store.users.map((u) => {
    if (u.id !== userId) return u;
    if (u.role === 'driver') {
      const driver: Driver = {
        ...(u as Driver),
        collegeIdUrl: payload.collegeIdUrl || u.collegeIdUrl,
        licenceUrl: payload.licenceUrl ?? (u as Driver).licenceUrl,
        rcUrl: payload.rcUrl ?? (u as Driver).rcUrl,
        insuranceUrl: payload.insuranceUrl ?? (u as Driver).insuranceUrl,
        bikeNumber: (payload.bikeNumber ?? (u as Driver).bikeNumber).toUpperCase(),
        bikeModel: payload.bikeModel ?? (u as Driver).bikeModel,
        helmetConfirmed: payload.helmetConfirmed ?? (u as Driver).helmetConfirmed,
        preferredRouteId: payload.preferredRouteId ?? (u as Driver).preferredRouteId,
        status: 'pending',
      };
      return driver;
    }
    return {
      ...u,
      collegeIdUrl: payload.collegeIdUrl || u.collegeIdUrl,
      status: 'pending' as VerificationStatus,
    };
  });

  const nextStore = { ...store, users: nextUsers };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore `addDoc(collection(db, 'rides'), ...)`
export function createRideBooking(
  store: PilotStore,
  input: {
    riderId: string;
    routeId: string;
    date: string;
    timeSlot: string;
    pickupPoint: string;
  }
): { ok: true; store: PilotStore; ride: Ride } | { ok: false; error: string } {
  const tomorrow = getTomorrowDateISO();
  if (input.date < tomorrow) {
    return {
      ok: false,
      error: 'Pilot rides are pre-booked for tomorrow onwards only. No instant booking.',
    };
  }
  const route = store.routes.find((r) => r.id === input.routeId);
  if (!route) {
    return { ok: false, error: 'Selected pilot route not found.' };
  }

  const fixedPrice = route.basePrice;
  const newRide: Ride = {
    id: `ride-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-3)}`,
    riderId: input.riderId,
    driverId: null,
    routeId: route.id,
    date: input.date,
    timeSlot: input.timeSlot,
    pickupPoint: input.pickupPoint,
    price: fixedPrice,
    status: 'pending',
    driverConfirmed: false,
    rating: null,
    createdAt: new Date().toISOString(),
  };

  const nextRoutes = store.routes.map((r) => {
    if (r.id !== route.id) return r;
    const currentSeats = r.seatsLeft[input.timeSlot] ?? 1;
    return {
      ...r,
      seatsLeft: {
        ...r.seatsLeft,
        [input.timeSlot]: Math.max(0, currentSeats - 1),
      },
    };
  });

  const nextStore: PilotStore = {
    ...store,
    rides: [newRide, ...store.rides],
    routes: nextRoutes,
  };
  saveStore(nextStore);
  return { ok: true, store: nextStore, ride: newRide };
}

// TODO: Replace with Firestore `updateDoc(doc(db, 'rides', rideId), { status: 'cancelled' })`
export function cancelRide(store: PilotStore, rideId: string): PilotStore {
  const nextRides = store.rides.map((r) =>
    r.id === rideId ? { ...r, status: 'cancelled' as const } : r
  );
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore transaction updating ride rating and driver aggregate rating
export function rateRideDriver(store: PilotStore, rideId: string, stars: number): PilotStore {
  const targetRide = store.rides.find((r) => r.id === rideId);
  const nextRides = store.rides.map((r) =>
    r.id === rideId ? { ...r, rating: stars } : r
  );
  let nextUsers = store.users;
  if (targetRide?.driverId) {
    nextUsers = store.users.map((u) => {
      if (u.id !== targetRide.driverId) return u;
      const count = u.ratingCount ?? 1;
      const avg = Number(((u.rating * count + stars) / (count + 1)).toFixed(1));
      return { ...u, rating: avg, ratingCount: count + 1 };
    });
  }
  const nextStore = { ...store, rides: nextRides, users: nextUsers };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore `updateDoc(doc(db, 'users', driverId), { availableTomorrow })`
export function toggleDriverAvailability(
  store: PilotStore,
  driverId: string,
  available: boolean
): PilotStore {
  const nextUsers = store.users.map((u) => {
    if (u.id !== driverId || u.role !== 'driver') return u;
    return { ...(u as Driver), availableTomorrow: available };
  });
  const nextStore = { ...store, users: nextUsers };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore `updateDoc` guarded by Firestore security rules (`driver.status == 'verified'`)
export function driverAcceptRide(
  store: PilotStore,
  driverId: string,
  rideId: string
): { ok: true; store: PilotStore } | { ok: false; error: string } {
  const driver = store.users.find((u) => u.id === driverId && u.role === 'driver');
  if (!driver || driver.status !== 'verified') {
    return {
      ok: false,
      error: 'Only verified REVA student drivers can accept rides.',
    };
  }
  const nextRides = store.rides.map((r) =>
    r.id === rideId
      ? {
          ...r,
          driverId,
          status: 'assigned' as const,
          driverConfirmed: true,
        }
      : r
  );
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return { ok: true, store: nextStore };
}

export function driverDeclineRide(
  store: PilotStore,
  driverId: string,
  rideId: string
): PilotStore {
  const nextRides = store.rides.map((r) => {
    if (r.id !== rideId || r.driverId !== driverId) return r;
    return {
      ...r,
      driverId: null,
      status: 'pending' as const,
      driverConfirmed: false,
    };
  });
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return nextStore;
}

export function driverCompleteRide(
  store: PilotStore,
  driverId: string,
  rideId: string
): PilotStore {
  const nextRides = store.rides.map((r) =>
    r.id === rideId && r.driverId === driverId
      ? { ...r, status: 'completed' as const, driverConfirmed: true }
      : r
  );
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Admin Cloud Function / Firestore privileged write
export function adminSetUserStatus(
  store: PilotStore,
  userId: string,
  status: VerificationStatus
): PilotStore {
  const nextUsers = store.users.map((u) =>
    u.id === userId ? { ...u, status } : u
  );
  const nextStore = { ...store, users: nextUsers };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore `updateDoc(doc(db, 'rides', rideId), { driverId, status: 'assigned' })`
export function adminAssignDriver(
  store: PilotStore,
  rideId: string,
  driverId: string
): { ok: true; store: PilotStore } | { ok: false; error: string } {
  const driver = store.users.find((u) => u.id === driverId && u.role === 'driver');
  if (!driver || driver.status !== 'verified') {
    return { ok: false, error: 'Selected driver is not verified.' };
  }
  const nextRides = store.rides.map((r) =>
    r.id === rideId
      ? {
          ...r,
          driverId,
          status: 'assigned' as const,
          driverConfirmed: false,
        }
      : r
  );
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return { ok: true, store: nextStore };
}

export function adminUpdateRideStatus(
  store: PilotStore,
  rideId: string,
  status: Ride['status']
): PilotStore {
  const nextRides = store.rides.map((r) =>
    r.id === rideId ? { ...r, status } : r
  );
  const nextStore = { ...store, rides: nextRides };
  saveStore(nextStore);
  return nextStore;
}

// TODO: Replace with Firestore `addDoc(collection(db, 'waitlist'), ...)`
export function addWaitlistEntry(
  store: PilotStore,
  entry: { name: string; email: string; area: string; preferredTime: string }
): { ok: true; store: PilotStore } | { ok: false; error: string } {
  if (!isRevaEmail(entry.email)) {
    return {
      ok: false,
      error: 'Please enter a valid REVA University email (.reva.edu.in or .edu.in).',
    };
  }
  const item: WaitlistEntry = {
    id: `wl-${Date.now()}`,
    name: entry.name.trim(),
    email: entry.email.trim().toLowerCase(),
    area: entry.area.trim(),
    preferredTime: entry.preferredTime,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const nextStore = { ...store, waitlist: [item, ...store.waitlist] };
  saveStore(nextStore);
  return { ok: true, store: nextStore };
}

// TODO: Replace with Firestore `addDoc(collection(db, 'safety_reports'), ...)`
export function submitSafetyReport(
  store: PilotStore,
  report: { rideId: string | null; userId: string; category: string; details: string }
): PilotStore {
  const item: SafetyReport = {
    id: `rep-${Date.now()}`,
    rideId: report.rideId,
    userId: report.userId,
    category: report.category,
    details: report.details.trim(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  const nextStore = { ...store, reports: [item, ...store.reports] };
  saveStore(nextStore);
  return nextStore;
}

export function getPilotMetrics(store: PilotStore) {
  const totalRides = store.rides.length;
  const matchedRides = store.rides.filter(
    (r) => r.driverId !== null && r.status !== 'cancelled'
  ).length;
  const matchRate = totalRides > 0 ? Math.round((matchedRides / totalRides) * 100) : 0;

  const riderCounts = new Map<string, number>();
  store.rides
    .filter((r) => r.status !== 'cancelled')
    .forEach((r) => {
      riderCounts.set(r.riderId, (riderCounts.get(r.riderId) ?? 0) + 1);
    });
  const activeRiders = riderCounts.size;
  const repeatRidersCount = Array.from(riderCounts.values()).filter((c) => c > 1).length;
  const repeatRidersPct =
    activeRiders > 0 ? Math.round((repeatRidersCount / activeRiders) * 100) : 0;

  const noShows = store.rides.filter((r) => r.status === 'no-show').length;
  const noShowRate = totalRides > 0 ? Math.round((noShows / totalRides) * 100) : 0;

  return {
    totalRides,
    matchRate,
    repeatRidersPct,
    noShowRate,
    verifiedDriversCount: store.users.filter(
      (u) => u.role === 'driver' && u.status === 'verified'
    ).length,
    verifiedRidersCount: store.users.filter(
      (u) => u.role === 'rider' && u.status === 'verified'
    ).length,
  };
}

export function getRoleHomeScreen(role: UserRole): 'rider-home' | 'driver-dashboard' | 'admin-dashboard' {
  if (role === 'driver') return 'driver-dashboard';
  if (role === 'admin') return 'admin-dashboard';
  return 'rider-home';
}
