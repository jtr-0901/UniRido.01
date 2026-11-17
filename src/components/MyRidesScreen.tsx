import { useState } from 'react';
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  Clock,
  Phone,
  Share2,
  ShieldAlert,
  Star,
  XCircle,
} from 'lucide-react';
import { Driver, Ride, Route } from '../types/unirido';
import { formatRideDate, maskPhone } from '../services/dataService';

interface MyRidesScreenProps {
  rides: Ride[];
  routes: Route[];
  drivers: Driver[];
  onCancelRide: (rideId: string) => void;
  onRateDriver: (rideId: string, stars: number) => void;
  onShareRide: (ride: Ride) => void;
  onTriggerSOS: (ride: Ride) => void;
  onReportProblem: (rideId: string) => void;
  onBookNewRide: () => void;
}

export function MyRidesScreen({
  rides,
  routes,
  drivers,
  onCancelRide,
  onRateDriver,
  onShareRide,
  onTriggerSOS,
  onReportProblem,
  onBookNewRide,
}: MyRidesScreenProps) {
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const upcomingRides = rides.filter(
    (r) => r.status === 'pending' || r.status === 'assigned'
  );
  const completedRides = rides.filter((r) => r.status === 'completed');
  const cancelledRides = rides.filter(
    (r) => r.status === 'cancelled' || r.status === 'no-show'
  );

  const activeList =
    tab === 'upcoming'
      ? upcomingRides
      : tab === 'completed'
        ? completedRides
        : cancelledRides;

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">My Rides</h1>
          <p className="text-xs text-slate-600">
            Pre-booked morning commutes & driver ratings
          </p>
        </div>
        <button
          type="button"
          onClick={onBookNewRide}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition"
        >
          Book Ride
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-200/70 rounded-xl gap-1">
        {(
          [
            { id: 'upcoming', label: `Upcoming (${upcomingRides.length})` },
            { id: 'completed', label: `Completed (${completedRides.length})` },
            { id: 'cancelled', label: `Cancelled (${cancelledRides.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              tab === item.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <Bike className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            No {tab} rides yet
          </p>
          <p className="text-xs text-slate-500">
            {tab === 'upcoming'
              ? 'Pre-book a fixed-price morning seat on Route A, B, or C for tomorrow.'
              : 'Your ride history will appear here.'}
          </p>
          {tab === 'upcoming' ? (
            <button
              type="button"
              onClick={onBookNewRide}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F59E0B] text-slate-950 font-semibold text-xs transition"
            >
              Browse Morning Routes
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeList.map((ride) => {
            const route = routes.find((r) => r.id === ride.routeId);
            const driver = ride.driverId
              ? drivers.find((d) => d.id === ride.driverId) || null
              : null;
            const isUpcoming = ride.status === 'pending' || ride.status === 'assigned';

            return (
              <article
                key={ride.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {ride.status === 'assigned' ? (
                        <span className="text-[#0F766E] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {ride.driverConfirmed ? 'Confirmed' : 'Driver Assigned'}
                          </span>
                        </span>
                      ) : ride.status === 'pending' ? (
                        <span className="text-amber-700 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Driver Match</span>
                        </span>
                      ) : ride.status === 'completed' ? (
                        <span className="text-[#0F766E] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="capitalize">{ride.status}</span>
                        </span>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 font-mono tabular-nums">
                        {formatRideDate(ride.date)} · {ride.timeSlot}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-sm text-slate-900">
                      {route ? route.name : ride.routeId}
                    </h2>
                    <p className="text-xs text-slate-600">
                      Pickup: {ride.pickupPoint}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-base text-[#0F766E] tabular-nums">
                      ₹{ride.price}
                    </p>
                    <p className="text-[11px] text-slate-500">UPI / Cash</p>
                  </div>
                </div>

                {/* Driver Details */}
                <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  {driver ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>
                          Driver: <span className="font-semibold text-slate-900">{driver.name}</span>
                        </span>
                        <span className="font-mono text-slate-800">{driver.bikeNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{driver.bikeModel}</span>
                        <span className="font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{maskPhone(driver.phone, Boolean(ride.driverConfirmed))}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-500">
                      Pilot admin is assigning a verified student driver to this slot.
                    </p>
                  )}
                </div>

                {/* Active Ride Actions: SOS + Share Ride always visible */}
                {isUpcoming ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onShareRide(ride)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Ride</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onTriggerSOS(ride)}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>SOS</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onReportProblem(ride.id)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelRide(ride.id)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 text-xs font-medium transition"
                      >
                        Cancel Ride
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Completed Ride: Rate Driver 1-5 Stars */}
                {ride.status === 'completed' ? (
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-700">
                        {ride.rating ? `You rated ${ride.rating}/5` : 'Rate Driver (1–5 stars)'}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const filled = (ride.rating ?? 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              aria-label={`Rate ${star} stars`}
                              onClick={() => onRateDriver(ride.id, star)}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-amber-50 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  filled
                                    ? 'text-[#F59E0B] fill-[#F59E0B]'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onReportProblem(ride.id)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Report</span>
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
