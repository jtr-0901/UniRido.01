import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HardHat,
  IndianRupee,
  Lock,
  Share2,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react';
import { AnyUser, Driver, Ride, Route } from '../types/unirido';
import { formatRideDate } from '../services/dataService';

interface DriverDashboardScreenProps {
  driver: Driver;
  rides: Ride[];
  routes: Route[];
  users: AnyUser[];
  onToggleAvailability: (available: boolean) => void;
  onAcceptRide: (rideId: string) => { ok: true } | { ok: false; error: string };
  onDeclineRide: (rideId: string) => void;
  onCompleteRide: (rideId: string) => void;
  onOpenVerification: () => void;
  onShareRide: (ride: Ride) => void;
  onTriggerSOS: (ride: Ride) => void;
}

export function DriverDashboardScreen({
  driver,
  rides,
  routes,
  users,
  onToggleAvailability,
  onAcceptRide,
  onDeclineRide,
  onCompleteRide,
  onOpenVerification,
  onShareRide,
  onTriggerSOS,
}: DriverDashboardScreenProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const isVerified = driver.status === 'verified';

  const myAssignedRides = rides.filter(
    (r) =>
      r.driverId === driver.id &&
      (r.status === 'assigned' || r.status === 'pending')
  );
  const openPendingRides = rides.filter(
    (r) => r.status === 'pending' && r.driverId === null
  );
  const completedRides = rides.filter(
    (r) => r.driverId === driver.id && r.status === 'completed'
  );

  const totalEarnings = completedRides.reduce((sum, r) => sum + r.price, 0);

  const handleAccept = (rideId: string) => {
    setActionError(null);
    const res = onAcceptRide(rideId);
    if (!res.ok) {
      setActionError(res.error);
    }
  };

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      {/* Verification Lock Banner for Unverified Drivers */}
      {!isVerified ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="font-display font-bold text-sm text-amber-950">
                Driver Verification {driver.status === 'rejected' ? 'Rejected' : 'Pending'}
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed">
                You cannot accept rides until the pilot admin verifies your REVA ID, Driving Licence, RC, and Insurance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenVerification}
            className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition"
          >
            Review / Upload Documents
          </button>
        </div>
      ) : null}

      {/* Earnings & Availability Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500">
              {driver.bikeModel || 'Two-wheeler'} · {driver.bikeNumber || 'Plate pending'}
            </p>
            <h1 className="font-display font-bold text-lg text-slate-900">
              {driver.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-xl text-[#0F766E] tabular-nums flex items-center justify-end">
              <IndianRupee className="w-4 h-4" />
              <span>{totalEarnings}</span>
            </p>
            <p className="text-[11px] text-slate-500">Pilot earnings (0% fee)</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-900">
              Available for tomorrow
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Carry spare pillion helmet</span>
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(driver.availableTomorrow)}
            disabled={!isVerified}
            onClick={() => onToggleAvailability(!driver.availableTomorrow)}
            className={`min-h-[44px] min-w-[84px] px-3.5 rounded-xl text-xs font-bold transition ${
              !isVerified
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : driver.availableTomorrow
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {driver.availableTomorrow ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {/* Assigned Rides */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-slate-900">
            Assigned Morning Rides ({myAssignedRides.length})
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {completedRides.length} completed
          </span>
        </div>

        {myAssignedRides.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-500">
            No rides assigned to you yet for tomorrow.
          </div>
        ) : (
          <div className="space-y-3">
            {myAssignedRides.map((ride) => {
              const route = routes.find((r) => r.id === ride.routeId);
              const rider = users.find((u) => u.id === ride.riderId);

              return (
                <article
                  key={ride.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-[#0F766E] font-semibold tabular-nums">
                        {formatRideDate(ride.date)} · {ride.timeSlot}
                      </p>
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        {route?.name ?? ride.routeId}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Pickup: <span className="font-semibold">{ride.pickupPoint}</span>
                      </p>
                    </div>
                    <p className="font-mono font-bold text-base text-[#0F766E] tabular-nums">
                      ₹{ride.price}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Rider: <span className="font-semibold text-slate-900">{rider?.name ?? 'REVA Student'}</span> ({rider?.usn ?? 'Verified'})
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {ride.driverConfirmed ? 'Accepted' : 'Awaiting confirm'}
                    </span>
                  </div>

                  {!ride.driverConfirmed ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        disabled={!isVerified}
                        onClick={() => handleAccept(ride.id)}
                        className={`min-h-[44px] rounded-xl font-semibold text-xs transition ${
                          isVerified
                            ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Accept Ride
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeclineRide(ride.id)}
                        className="min-h-[44px] rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onCompleteRide(ride.id)}
                        className="w-full min-h-[48px] rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onShareRide(ride)}
                          className="min-h-[44px] rounded-xl bg-teal-50 text-[#0F766E] font-semibold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Ride</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onTriggerSOS(ride)}
                          className="min-h-[44px] rounded-xl bg-red-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>SOS</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Open Unassigned Pilot Requests */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-base text-slate-900">
          Open Pilot Requests ({openPendingRides.length})
        </h2>

        {openPendingRides.length === 0 ? (
          <p className="text-xs text-slate-500">No open unassigned requests right now.</p>
        ) : (
          <div className="space-y-3">
            {openPendingRides.map((ride) => {
              const route = routes.find((r) => r.id === ride.routeId);
              const rider = users.find((u) => u.id === ride.riderId);

              return (
                <article
                  key={ride.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-amber-700 font-semibold flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatRideDate(ride.date)} · {ride.timeSlot}
                        </span>
                      </p>
                      <h3 className="font-display font-bold text-sm text-slate-900 mt-0.5">
                        {route?.name ?? ride.routeId}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Pickup: {ride.pickupPoint} · Rider: {rider?.name ?? 'REVA Student'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-base text-[#0F766E] tabular-nums">
                      ₹{ride.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!isVerified}
                    onClick={() => handleAccept(ride.id)}
                    className={`w-full min-h-[44px] rounded-xl font-semibold text-xs transition ${
                      isVerified
                        ? 'bg-[#0F766E] hover:bg-[#115E59] text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isVerified
                      ? 'Accept Ride Request'
                      : 'Verification Required to Accept'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
