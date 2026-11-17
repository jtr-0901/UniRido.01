import { useState } from 'react';
import { Check, Eye, ShieldCheck, X } from 'lucide-react';
import {
  AnyUser,
  Driver,
  Ride,
  Route,
  SafetyReport,
  VerificationStatus,
  WaitlistEntry,
} from '../types/unirido';
import { formatRideDate } from '../services/dataService';

interface AdminDashboardScreenProps {
  users: AnyUser[];
  rides: Ride[];
  routes: Route[];
  waitlist: WaitlistEntry[];
  reports: SafetyReport[];
  metrics: {
    totalRides: number;
    matchRate: number;
    repeatRidersPct: number;
    noShowRate: number;
    verifiedDriversCount: number;
    verifiedRidersCount: number;
  };
  onSetUserStatus: (userId: string, status: VerificationStatus) => void;
  onAssignDriver: (
    rideId: string,
    driverId: string
  ) => { ok: true } | { ok: false; error: string };
  onUpdateRideStatus: (rideId: string, status: Ride['status']) => void;
  onPreviewDocs: (user: AnyUser) => void;
}

export function AdminDashboardScreen({
  users,
  rides,
  routes,
  waitlist,
  reports,
  metrics,
  onSetUserStatus,
  onAssignDriver,
  onUpdateRideStatus,
  onPreviewDocs,
}: AdminDashboardScreenProps) {
  const [tab, setTab] = useState<'users' | 'drivers' | 'rides' | 'waitlist'>('drivers');
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

  const riders = users.filter((u) => u.role === 'rider');
  const drivers = users.filter((u): u is Driver => u.role === 'driver');
  const verifiedDrivers = drivers.filter((d) => d.status === 'verified');

  const handleAssign = (rideId: string) => {
    const pickedDriverId =
      selectedDrivers[rideId] || verifiedDrivers[0]?.id || '';
    if (!pickedDriverId) {
      setAssignMessage('Verify at least one driver before assigning.');
      return;
    }
    const res = onAssignDriver(rideId, pickedDriverId);
    if (!res.ok) {
      setAssignMessage(res.error);
      return;
    }
    setAssignMessage(`Assigned verified driver to ${rideId}.`);
    window.setTimeout(() => setAssignMessage(null), 2500);
  };

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#0F766E] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Founder Pilot Operations</span>
        </p>
        <h1 className="font-display font-bold text-xl text-slate-900">
          Admin Dashboard
        </h1>
      </div>

      {/* Pilot Stats Strip (4 tabular figures) */}
      <div className="bg-white border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="p-3.5">
          <p className="text-[11px] text-slate-500">Total Rides</p>
          <p className="font-mono font-bold text-lg text-slate-900 tabular-nums mt-0.5">
            {metrics.totalRides}
          </p>
        </div>
        <div className="p-3.5">
          <p className="text-[11px] text-slate-500">Match Rate</p>
          <p className="font-mono font-bold text-lg text-[#0F766E] tabular-nums mt-0.5">
            {metrics.matchRate}%
          </p>
        </div>
        <div className="p-3.5">
          <p className="text-[11px] text-slate-500">Repeat Riders</p>
          <p className="font-mono font-bold text-lg text-slate-900 tabular-nums mt-0.5">
            {metrics.repeatRidersPct}%
          </p>
        </div>
        <div className="p-3.5">
          <p className="text-[11px] text-slate-500">No-Show Rate</p>
          <p className="font-mono font-bold text-lg text-slate-900 tabular-nums mt-0.5">
            {metrics.noShowRate}%
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="grid grid-cols-4 p-1 bg-slate-200/70 rounded-xl gap-1">
        {(
          [
            { id: 'users', label: `Users (${riders.length})` },
            { id: 'drivers', label: `Drivers (${drivers.length})` },
            { id: 'rides', label: `Rides (${rides.length})` },
            { id: 'waitlist', label: `Waitlist (${waitlist.length})` },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[40px] px-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
              tab === item.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {assignMessage ? (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium">
          {assignMessage}
        </div>
      ) : null}

      {/* USERS TAB */}
      {tab === 'users' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-100">
            {riders.map((u) => (
              <div key={u.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {u.usn} · {u.email}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize shrink-0 ${
                      u.status === 'verified'
                        ? 'text-[#0F766E]'
                        : u.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-amber-700'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewDocs(u)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetUserStatus(u.id, 'verified')}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetUserStatus(u.id, 'rejected')}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* DRIVERS TAB */}
      {tab === 'drivers' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-100">
            {drivers.map((d) => (
              <div key={d.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {d.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {d.usn} · {d.bikeNumber || 'No plate'} ({d.bikeModel || 'Bike'})
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize shrink-0 ${
                      d.status === 'verified'
                        ? 'text-[#0F766E]'
                        : d.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-amber-700'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onPreviewDocs(d)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Docs (4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetUserStatus(d.id, 'verified')}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetUserStatus(d.id, 'rejected')}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* RIDES TAB */}
      {tab === 'rides' ? (
        <div className="space-y-3">
          {rides.map((ride) => {
            const route = routes.find((r) => r.id === ride.routeId);
            const rider = users.find((u) => u.id === ride.riderId);
            const assignedDriver = ride.driverId
              ? drivers.find((d) => d.id === ride.driverId)
              : null;

            return (
              <div
                key={ride.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-slate-500 tabular-nums">
                      {ride.id} · {formatRideDate(ride.date)} · {ride.timeSlot}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {route?.name ?? ride.routeId}
                    </p>
                    <p className="text-xs text-slate-600">
                      Rider: {rider?.name ?? ride.riderId} · Stop: {ride.pickupPoint}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm text-[#0F766E] tabular-nums">
                      ₹{ride.price}
                    </p>
                    <p className="text-[11px] font-semibold capitalize text-slate-700">
                      {ride.status}
                    </p>
                  </div>
                </div>

                {ride.status === 'pending' || ride.status === 'assigned' ? (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Assign driver for ${ride.id}`}
                        value={
                          selectedDrivers[ride.id] ??
                          ride.driverId ??
                          verifiedDrivers[0]?.id ??
                          ''
                        }
                        onChange={(e) =>
                          setSelectedDrivers((prev) => ({
                            ...prev,
                            [ride.id]: e.target.value,
                          }))
                        }
                        className="flex-1 min-h-[40px] px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                      >
                        {verifiedDrivers.length === 0 ? (
                          <option value="">No verified drivers available</option>
                        ) : (
                          verifiedDrivers.map((vd) => (
                            <option key={vd.id} value={vd.id}>
                              {vd.name} ({vd.bikeNumber})
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleAssign(ride.id)}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold whitespace-nowrap"
                      >
                        {assignedDriver ? 'Reassign' : 'Assign'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {assignedDriver
                          ? `Current: ${assignedDriver.name}`
                          : 'Unassigned'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateRideStatus(ride.id, 'no-show')}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Mark No-Show
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* WAITLIST TAB */}
      {tab === 'waitlist' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {waitlist.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                No waitlist requests yet.
              </p>
            ) : (
              waitlist.map((w) => (
                <div key={w.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {w.area}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {w.name} · <span className="font-mono">{w.email}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold text-[#0F766E] tabular-nums">
                      {w.preferredTime}
                    </p>
                    <p className="text-[11px] text-slate-400">{w.createdAt}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {reports.length > 0 ? (
            <div className="space-y-2">
              <h2 className="font-display font-bold text-sm text-slate-900">
                Submitted Safety Reports ({reports.length})
              </h2>
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-3.5 space-y-1 text-xs">
                    <p className="font-semibold text-red-700">{rep.category}</p>
                    <p className="text-slate-700">{rep.details}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {rep.rideId || 'General'} · {rep.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
