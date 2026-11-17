import { ArrowRight, CheckCircle2, Clock, MapPin, ShieldCheck, XCircle } from 'lucide-react';
import { AnyUser, Driver, Ride, Route } from '../types/unirido';
import { formatRideDate } from '../services/dataService';

interface RiderHomeScreenProps {
  user: AnyUser;
  routes: Route[];
  drivers: Driver[];
  upcomingRide: Ride | null;
  onSelectRoute: (routeId: string, timeSlot?: string) => void;
  onOpenVerification: () => void;
  onOpenMyRides: () => void;
}

export function RiderHomeScreen({
  user,
  routes,
  drivers,
  upcomingRide,
  onSelectRoute,
  onOpenVerification,
  onOpenMyRides,
}: RiderHomeScreenProps) {
  const verifiedDrivers = drivers.filter((d) => d.status === 'verified');

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      {/* Greeting & Trust Header */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#0F766E]">
          Verified REVA Student Only · Fixed Price, No Surge
        </p>
        <h1 className="font-display font-bold text-2xl text-slate-900">
          Morning rides to REVA
        </h1>
        <p className="text-xs text-slate-600">
          Pre-book tomorrow’s commute on one of 3 fixed pilot routes.
        </p>
      </div>

      {/* Verification Status Notice */}
      {user.status !== 'verified' ? (
        <button
          type="button"
          onClick={onOpenVerification}
          className={`w-full text-left border rounded-2xl p-3.5 flex items-start justify-between gap-3 transition ${
            user.status === 'rejected'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {user.status === 'rejected' ? (
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="text-xs font-bold">
                {user.status === 'rejected'
                  ? 'REVA ID Rejected — Re-upload Required'
                  : 'Verification Status: Pending'}
              </p>
              <p className="text-[11px] opacity-90">
                {user.status === 'rejected'
                  ? 'Tap to re-submit a clear College ID photo.'
                  : 'You can pre-book a ride for tomorrow now while your ID is reviewed.'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 mt-1" />
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span>
            Signed in as <span className="font-semibold text-slate-900">{user.name}</span> ({user.usn}) · Verified
          </span>
        </div>
      )}

      {/* Next Upcoming Ride Shortcut */}
      {upcomingRide ? (
        <button
          type="button"
          onClick={onOpenMyRides}
          className="w-full text-left bg-teal-900 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:bg-teal-950 transition"
        >
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] font-medium text-teal-200">
              Next Pre-Booked Ride · {formatRideDate(upcomingRide.date)}
            </p>
            <p className="font-display font-bold text-sm truncate">
              {upcomingRide.pickupPoint} → REVA University
            </p>
            <p className="text-xs font-mono text-teal-100 tabular-nums">
              {upcomingRide.timeSlot} · ₹{upcomingRide.price} ·{' '}
              {upcomingRide.status === 'assigned' ? 'Driver Assigned' : 'Pending Match'}
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
        </button>
      ) : null}

      {/* 3 Fixed Pilot Routes */}
      <div className="space-y-3.5">
        {routes.map((route) => {
          const matchedDriver = verifiedDrivers.find(
            (d) => d.preferredRouteId === route.id && d.availableTomorrow
          );
          const totalSeats = Object.values(route.seatsLeft).reduce((a, b) => a + b, 0);

          return (
            <article
              key={route.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-slate-500">
                    {route.distanceKm} km · {totalSeats} seats left · Daytime pilot
                  </p>
                  <h2 className="font-display font-bold text-base text-slate-900">
                    {route.name}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-lg text-[#0F766E] tabular-nums leading-none">
                    ₹{route.basePrice}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Fixed fare</p>
                </div>
              </div>

              {/* Pickup stops */}
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Stops: {route.pickupPoints.join(' · ')}
                </p>
              </div>

              {/* Driver assignment preview */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>
                    {matchedDriver
                      ? `Pilot Driver: ${matchedDriver.name} (${matchedDriver.bikeNumber})`
                      : 'Pilot Driver assigned after pre-booking'}
                  </span>
                </span>
              </div>

              {/* Time slot quick-book buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                {route.timeSlots.map((slot) => {
                  const left = route.seatsLeft[slot] ?? 0;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onSelectRoute(route.id, slot)}
                      className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/50 text-left flex items-center justify-between gap-2 transition active:scale-[0.98]"
                    >
                      <div>
                        <p className="font-mono font-semibold text-xs text-slate-900 tabular-nums">
                          {slot}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {left} {left === 1 ? 'seat' : 'seats'} left
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
