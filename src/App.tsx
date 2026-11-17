import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  AnyUser,
  AppScreen,
  Driver,
  Ride,
  VerificationStatus,
} from './types/unirido';
import {
  addWaitlistEntry,
  adminAssignDriver,
  adminSetUserStatus,
  adminUpdateRideStatus,
  cancelRide,
  createRideBooking,
  driverAcceptRide,
  driverCompleteRide,
  driverDeclineRide,
  getPilotMetrics,
  getRoleHomeScreen,
  loadStore,
  loginUser,
  PilotStore,
  rateRideDriver,
  registerUser,
  resetPilotStore,
  submitSafetyReport,
  submitVerificationDocuments,
  switchSessionUser,
  toggleDriverAvailability,
} from './services/dataService';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { LandingScreen } from './components/LandingScreen';
import { AuthScreen } from './components/AuthScreen';
import { VerificationScreen } from './components/VerificationScreen';
import { RiderHomeScreen } from './components/RiderHomeScreen';
import { BookRideScreen } from './components/BookRideScreen';
import { MyRidesScreen } from './components/MyRidesScreen';
import { DriverDashboardScreen } from './components/DriverDashboardScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { ProfileScreen } from './components/ProfileScreen';
import {
  DocPreviewModal,
  ReportProblemModal,
  ShareRideModal,
  SOSModal,
} from './components/SafetyModals';

export default function App() {
  const [store, setStore] = useState<PilotStore>(() => loadStore());
  const [screen, setScreen] = useState<AppScreen>(() => {
    const initial = loadStore();
    if (!initial.currentUserId) return 'landing';
    const user = initial.users.find((u) => u.id === initial.currentUserId);
    return user ? getRoleHomeScreen(user.role) : 'landing';
  });

  const [authIntent, setAuthIntent] = useState<{
    mode: 'login' | 'signup';
    role: 'rider' | 'driver';
  }>({ mode: 'signup', role: 'rider' });

  const [bookingRouteId, setBookingRouteId] = useState<string>('route-a');
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string | undefined>(
    undefined
  );

  // Safety & Admin Modal states
  const [sosRide, setSosRide] = useState<Ride | null>(null);
  const [shareRide, setShareRide] = useState<Ride | null>(null);
  const [reportRideId, setReportRideId] = useState<string | null | undefined>(
    undefined
  );
  const [previewUser, setPreviewUser] = useState<AnyUser | null>(null);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const currentUser = useMemo(
    () => store.users.find((u) => u.id === store.currentUserId) ?? null,
    [store.users, store.currentUserId]
  );

  const drivers = useMemo(
    () => store.users.filter((u): u is Driver => u.role === 'driver'),
    [store.users]
  );

  const metrics = useMemo(() => getPilotMetrics(store), [store]);

  const demoUsers = useMemo(() => {
    const pickIds = ['rider-1', 'driver-1', 'driver-3', 'admin-1'];
    const picked = pickIds
      .map((id) => store.users.find((u) => u.id === id))
      .filter((u): u is AnyUser => Boolean(u));
    return picked.length > 0 ? picked : store.users.slice(0, 4);
  }, [store.users]);

  const riderRides = useMemo(() => {
    if (!currentUser) return [];
    return store.rides.filter((r) => r.riderId === currentUser.id);
  }, [store.rides, currentUser]);

  const nextUpcomingRide = useMemo(() => {
    return (
      riderRides.find(
        (r) => r.status === 'assigned' || r.status === 'pending'
      ) ?? null
    );
  }, [riderRides]);

  const handleSwitchDemoUser = (userId: string) => {
    const nextStore = switchSessionUser(store, userId);
    setStore(nextStore);
    const user = nextStore.users.find((u) => u.id === userId);
    if (user) {
      setScreen(getRoleHomeScreen(user.role));
    }
    setRoleSwitcherOpen(false);
  };

  const handleSignUp = (input: {
    name: string;
    email: string;
    phone: string;
    usn: string;
    role: 'rider' | 'driver';
    password: string;
  }) => {
    const res = registerUser(store, input);
    if (!res.ok) return { ok: false as const, error: res.error };
    setStore(res.store);
    setScreen('verification');
    return { ok: true as const };
  };

  const handleLogin = (email: string, password: string) => {
    const res = loginUser(store, email, password);
    if (!res.ok) return { ok: false as const, error: res.error };
    setStore(res.store);
    setScreen(getRoleHomeScreen(res.user.role));
    return { ok: true as const };
  };

  const handleLogout = () => {
    const nextStore = switchSessionUser(store, null);
    setStore(nextStore);
    setScreen('landing');
  };

  const handleResetData = () => {
    const fresh = resetPilotStore();
    setStore(fresh);
    setScreen('landing');
    setRoleSwitcherOpen(false);
  };

  const handleBackNavigation = () => {
    if (screen === 'book-ride') {
      setScreen('rider-home');
      return;
    }
    if (screen === 'verification' && currentUser) {
      setScreen(getRoleHomeScreen(currentUser.role));
      return;
    }
    if (screen === 'auth') {
      setScreen('landing');
      return;
    }
    setScreen('landing');
  };

  const showBackButton =
    screen === 'auth' || screen === 'book-ride' || screen === 'verification';

  const showBottomNav = Boolean(
    currentUser &&
      screen !== 'landing' &&
      screen !== 'auth' &&
      screen !== 'verification'
  );

  // Lookup helpers for modals
  const modalRide = sosRide || shareRide;
  const modalRoute = modalRide
    ? store.routes.find((r) => r.id === modalRide.routeId)
    : undefined;
  const modalDriver =
    modalRide && modalRide.driverId
      ? drivers.find((d) => d.id === modalRide.driverId) ?? null
      : null;
  const modalRider = modalRide
    ? store.users.find((u) => u.id === modalRide.riderId) ?? currentUser
    : currentUser;

  return (
    <div className="min-h-dvh bg-[#EEF2F6] flex flex-col items-center">
      {/* Mobile-first 480px Phone Container */}
      <div className="w-full max-w-[480px] min-h-dvh bg-[#F8FAFC] flex flex-col shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_20px_50px_-12px_rgba(15,23,42,0.08)]">
        <TopBar
          currentScreen={screen}
          currentUser={currentUser}
          onNavigate={setScreen}
          onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
          showBack={showBackButton}
          onBack={handleBackNavigation}
        />

        <main className="flex-1">
          {screen === 'landing' ? (
            <LandingScreen
              onBookRideCTA={() => {
                if (currentUser) {
                  setScreen('rider-home');
                } else {
                  setAuthIntent({ mode: 'signup', role: 'rider' });
                  setScreen('auth');
                }
              }}
              onBecomeDriverCTA={() => {
                if (currentUser && currentUser.role === 'driver') {
                  setScreen('driver-dashboard');
                } else {
                  setAuthIntent({ mode: 'signup', role: 'driver' });
                  setScreen('auth');
                }
              }}
              onJoinWaitlist={(entry) => {
                const res = addWaitlistEntry(store, entry);
                if (!res.ok) return { ok: false as const, error: res.error };
                setStore(res.store);
                return { ok: true as const };
              }}
              demoUsers={demoUsers}
              onSwitchDemoUser={handleSwitchDemoUser}
            />
          ) : null}

          {screen === 'auth' ? (
            <AuthScreen
              initialMode={authIntent.mode}
              initialRole={authIntent.role}
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              demoUsers={demoUsers}
              onSwitchDemoUser={handleSwitchDemoUser}
            />
          ) : null}

          {screen === 'verification' && currentUser ? (
            <VerificationScreen
              user={currentUser}
              routes={store.routes}
              onSubmitDocs={(payload) => {
                const next = submitVerificationDocuments(
                  store,
                  currentUser.id,
                  payload
                );
                setStore(next);
              }}
              onContinue={() => setScreen(getRoleHomeScreen(currentUser.role))}
            />
          ) : null}

          {screen === 'rider-home' && currentUser ? (
            <RiderHomeScreen
              user={currentUser}
              routes={store.routes}
              drivers={drivers}
              upcomingRide={nextUpcomingRide}
              onSelectRoute={(routeId, timeSlot) => {
                setBookingRouteId(routeId);
                setBookingTimeSlot(timeSlot);
                setScreen('book-ride');
              }}
              onOpenVerification={() => setScreen('verification')}
              onOpenMyRides={() => setScreen('my-rides')}
            />
          ) : null}

          {screen === 'book-ride' && currentUser ? (
            <BookRideScreen
              routes={store.routes}
              initialRouteId={bookingRouteId}
              initialTimeSlot={bookingTimeSlot}
              drivers={drivers}
              onConfirmBooking={(input) => {
                const res = createRideBooking(store, {
                  riderId: currentUser.id,
                  ...input,
                });
                if (!res.ok) return { ok: false as const, error: res.error };
                setStore(res.store);
                return { ok: true as const, ride: res.ride };
              }}
              onShareRide={(ride) => setShareRide(ride)}
              onTriggerSOS={(ride) => setSosRide(ride)}
              onGoToMyRides={() => setScreen('my-rides')}
            />
          ) : null}

          {screen === 'my-rides' && currentUser ? (
            <MyRidesScreen
              rides={
                currentUser.role === 'driver'
                  ? store.rides.filter(
                      (r) =>
                        r.riderId === currentUser.id ||
                        r.driverId === currentUser.id
                    )
                  : riderRides
              }
              routes={store.routes}
              drivers={drivers}
              onCancelRide={(rideId) => setStore(cancelRide(store, rideId))}
              onRateDriver={(rideId, stars) =>
                setStore(rateRideDriver(store, rideId, stars))
              }
              onShareRide={(ride) => setShareRide(ride)}
              onTriggerSOS={(ride) => setSosRide(ride)}
              onReportProblem={(rideId) => setReportRideId(rideId)}
              onBookNewRide={() => setScreen('rider-home')}
            />
          ) : null}

          {screen === 'driver-dashboard' &&
          currentUser &&
          currentUser.role === 'driver' ? (
            <DriverDashboardScreen
              driver={currentUser as Driver}
              rides={store.rides}
              routes={store.routes}
              users={store.users}
              onToggleAvailability={(avail) =>
                setStore(toggleDriverAvailability(store, currentUser.id, avail))
              }
              onAcceptRide={(rideId) => {
                const res = driverAcceptRide(store, currentUser.id, rideId);
                if (!res.ok) return { ok: false as const, error: res.error };
                setStore(res.store);
                return { ok: true as const };
              }}
              onDeclineRide={(rideId) =>
                setStore(driverDeclineRide(store, currentUser.id, rideId))
              }
              onCompleteRide={(rideId) =>
                setStore(driverCompleteRide(store, currentUser.id, rideId))
              }
              onOpenVerification={() => setScreen('verification')}
              onShareRide={(ride) => setShareRide(ride)}
              onTriggerSOS={(ride) => setSosRide(ride)}
            />
          ) : null}

          {screen === 'admin-dashboard' &&
          currentUser &&
          currentUser.role === 'admin' ? (
            <AdminDashboardScreen
              users={store.users}
              rides={store.rides}
              routes={store.routes}
              waitlist={store.waitlist}
              reports={store.reports}
              metrics={metrics}
              onSetUserStatus={(userId, status: VerificationStatus) =>
                setStore(adminSetUserStatus(store, userId, status))
              }
              onAssignDriver={(rideId, driverId) => {
                const res = adminAssignDriver(store, rideId, driverId);
                if (!res.ok) return { ok: false as const, error: res.error };
                setStore(res.store);
                return { ok: true as const };
              }}
              onUpdateRideStatus={(rideId, status) =>
                setStore(adminUpdateRideStatus(store, rideId, status))
              }
              onPreviewDocs={(user) => setPreviewUser(user)}
            />
          ) : null}

          {screen === 'profile' && currentUser ? (
            <ProfileScreen
              user={currentUser}
              allUsers={store.users}
              onOpenVerification={() => setScreen('verification')}
              onReportProblem={() => setReportRideId(null)}
              onSwitchUser={handleSwitchDemoUser}
              onResetPilotData={handleResetData}
              onLogout={handleLogout}
            />
          ) : null}
        </main>

        {showBottomNav && currentUser ? (
          <BottomNav
            currentScreen={screen}
            currentUser={currentUser}
            onNavigate={setScreen}
          />
        ) : null}
      </div>

      {/* Role Switcher Sheet for seamless Pilot testing */}
      {roleSwitcherOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Switch Pilot Account"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900">
                  Switch Pilot Account
                </h2>
                <p className="text-xs text-slate-500">
                  Test Rider, Driver, and Founder Admin workflows instantly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(false)}
                aria-label="Close role switcher"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto">
              {store.users.map((u) => {
                const active = u.id === currentUser?.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSwitchDemoUser(u.id)}
                    className={`w-full min-h-[52px] px-4 py-2.5 flex items-center justify-between text-left transition ${
                      active ? 'bg-teal-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono truncate">
                        {u.usn} · {u.email}
                      </p>
                    </div>
                    <span className="text-xs font-semibold capitalize text-[#0F766E] shrink-0 ml-2">
                      {active ? 'Active' : `${u.role} · ${u.status}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {currentUser ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRoleSwitcherOpen(false);
                    handleLogout();
                  }}
                  className="min-h-[44px] rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Back to Landing
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="min-h-[44px] rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Reset Pilot Data
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Safety & Verification Modals */}
      <SOSModal
        open={Boolean(sosRide)}
        ride={sosRide}
        route={modalRoute}
        driver={modalDriver}
        onClose={() => setSosRide(null)}
      />

      <ShareRideModal
        open={Boolean(shareRide)}
        ride={shareRide}
        route={modalRoute}
        driver={modalDriver}
        rider={modalRider}
        onClose={() => setShareRide(null)}
      />

      <ReportProblemModal
        open={reportRideId !== undefined}
        rideId={reportRideId ?? null}
        onSubmit={(category, details) => {
          if (!currentUser) return;
          setStore(
            submitSafetyReport(store, {
              rideId: reportRideId ?? null,
              userId: currentUser.id,
              category,
              details,
            })
          );
        }}
        onClose={() => setReportRideId(undefined)}
      />

      <DocPreviewModal
        user={previewUser}
        onClose={() => setPreviewUser(null)}
      />
    </div>
  );
}
