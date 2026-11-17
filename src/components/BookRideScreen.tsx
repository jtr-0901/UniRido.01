import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  HardHat,
  MapPin,
  Phone,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Driver, Ride, Route } from '../types/unirido';
import { formatRideDate, maskPhone } from '../services/dataService';
import { getOffsetDateISO, getTomorrowDateISO } from '../services/mockData';

interface BookRideScreenProps {
  routes: Route[];
  initialRouteId: string;
  initialTimeSlot?: string;
  drivers: Driver[];
  onConfirmBooking: (input: {
    routeId: string;
    date: string;
    timeSlot: string;
    pickupPoint: string;
  }) => { ok: true; ride: Ride } | { ok: false; error: string };
  onShareRide: (ride: Ride) => void;
  onTriggerSOS: (ride: Ride) => void;
  onGoToMyRides: () => void;
}

export function BookRideScreen({
  routes,
  initialRouteId,
  initialTimeSlot,
  drivers,
  onConfirmBooking,
  onShareRide,
  onTriggerSOS,
  onGoToMyRides,
}: BookRideScreenProps) {
  const tomorrow = getTomorrowDateISO();
  const dayAfter = getOffsetDateISO(2);

  const [routeId, setRouteId] = useState(initialRouteId || routes[0].id);
  const selectedRoute = routes.find((r) => r.id === routeId) || routes[0];

  const [date, setDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState(
    initialTimeSlot && selectedRoute.timeSlots.includes(initialTimeSlot)
      ? initialTimeSlot
      : selectedRoute.timeSlots[0]
  );
  const [pickupPoint, setPickupPoint] = useState(selectedRoute.pickupPoints[0]);
  const [helmetAck, setHelmetAck] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRide, setConfirmedRide] = useState<Ride | null>(null);

  const handleRouteChange = (nextId: string) => {
    setRouteId(nextId);
    const nextRoute = routes.find((r) => r.id === nextId) || routes[0];
    setTimeSlot(nextRoute.timeSlots[0]);
    setPickupPoint(nextRoute.pickupPoints[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!helmetAck) {
      setError('Please acknowledge the pillion helmet safety guideline.');
      return;
    }
    const res = onConfirmBooking({
      routeId: selectedRoute.id,
      date,
      timeSlot,
      pickupPoint,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setConfirmedRide(res.ride);
  };

  if (confirmedRide) {
    const confirmedRoute =
      routes.find((r) => r.id === confirmedRide.routeId) || selectedRoute;
    const assignedDriver = confirmedRide.driverId
      ? drivers.find((d) => d.id === confirmedRide.driverId) || null
      : null;
    const standbyDriver = drivers.find(
      (d) => d.status === 'verified' && d.preferredRouteId === confirmedRoute.id
    );
    const displayDriver = assignedDriver || standbyDriver || null;
    const isDriverConfirmed = Boolean(confirmedRide.driverConfirmed && assignedDriver);

    return (
      <div className="px-4 py-5 space-y-5 pb-24">
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#0F766E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#0F766E]">
              Pre-Booking Confirmed · Ref {confirmedRide.id}
            </p>
            <h1 className="font-display font-bold text-lg text-slate-900">
              Ride scheduled for {formatRideDate(confirmedRide.date)}
            </h1>
            <p className="text-xs text-slate-600">
              {assignedDriver
                ? 'Your pilot driver has been assigned.'
                : 'Your ride request is queued for pilot driver assignment before tonight.'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-500">
                {formatRideDate(confirmedRide.date)} · {confirmedRide.timeSlot}
              </p>
              <h2 className="font-display font-bold text-base text-slate-900 mt-0.5">
                {confirmedRoute.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Pickup: <span className="font-semibold">{confirmedRide.pickupPoint}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-lg text-[#0F766E] tabular-nums">
                ₹{confirmedRide.price}
              </p>
              <p className="text-[11px] text-slate-500">Fixed fare</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Driver Name</span>
              <span className="font-semibold text-slate-900">
                {assignedDriver
                  ? assignedDriver.name
                  : displayDriver
                    ? `${displayDriver.name} (Pending confirm)`
                    : 'Awaiting Admin Assignment'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Bike Number</span>
              <span className="font-mono font-semibold text-slate-900">
                {displayDriver ? displayDriver.bikeNumber : 'Assigned tonight'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Driver Phone</span>
              <span className="font-mono text-slate-800 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>
                  {displayDriver
                    ? maskPhone(displayDriver.phone, isDriverConfirmed)
                    : '+91 98*** **000 (masked)'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">Payment</span>
              <span className="font-semibold text-slate-900">
                Pay driver by UPI / Cash on ride
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Active Ride Safety Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onShareRide(confirmedRide)}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Ride</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerSOS(confirmedRide)}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onGoToMyRides}
          className="w-full min-h-[44px] rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition"
        >
          View in My Rides
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 pb-24">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#0F766E]">
          Pre-Book Only · Tomorrow Onwards · Fixed Cost-Share
        </p>
        <h1 className="font-display font-bold text-xl text-slate-900">
          Reserve your morning seat
        </h1>
      </div>

      {/* Route Picker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <label htmlFor="book-route" className="block text-xs font-semibold text-slate-700">
          1. Select Pilot Route
        </label>
        <select
          id="book-route"
          value={selectedRoute.id}
          onChange={(e) => handleRouteChange(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        >
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (₹{r.basePrice})
            </option>
          ))}
        </select>
      </div>

      {/* Date Picker (Tomorrow onwards only) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="book-date" className="text-xs font-semibold text-slate-700">
            2. Morning Date (Tomorrow onwards only)
          </label>
          <Calendar className="w-4 h-4 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDate(tomorrow)}
            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              date === tomorrow
                ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Tomorrow ({formatRideDate(tomorrow) === 'Tomorrow' ? tomorrow.slice(5) : tomorrow})
          </button>
          <button
            type="button"
            onClick={() => setDate(dayAfter)}
            className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              date === dayAfter
                ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {formatRideDate(dayAfter)}
          </button>
        </div>
        <input
          id="book-date"
          type="date"
          min={tomorrow}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />
      </div>

      {/* Time Slot & Pickup Point */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-700">
            3. Fixed Morning Time Slot
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {selectedRoute.timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`min-h-[44px] px-3 py-2 rounded-xl border font-mono text-sm font-semibold tabular-nums transition ${
                  timeSlot === slot
                    ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="book-pickup" className="block text-xs font-semibold text-slate-700">
            4. Preset Pickup Point
          </label>
          <div className="space-y-2">
            {selectedRoute.pickupPoints.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setPickupPoint(pt)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-sm flex items-center gap-2.5 transition ${
                  pickupPoint === pt
                    ? 'border-[#0F766E] bg-teal-50/70 text-slate-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <MapPin
                  className={`w-4 h-4 shrink-0 ${
                    pickupPoint === pt ? 'text-[#0F766E]' : 'text-slate-400'
                  }`}
                />
                <span>{pt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Price Summary Before Confirming */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Fixed Cost-Share Fare</p>
            <p className="text-[11px] text-slate-500">
              {selectedRoute.distanceKm} km · Zero surge · No commission
            </p>
          </div>
          <p className="font-mono font-bold text-2xl text-[#0F766E] tabular-nums">
            ₹{selectedRoute.basePrice}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-700 flex items-center justify-between">
          <span>Payment mode</span>
          <span className="font-semibold">Pay driver by UPI / Cash on ride</span>
        </div>

        <label className="flex items-start gap-2.5 pt-2 border-t border-slate-100 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={helmetAck}
            onChange={(e) => setHelmetAck(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
          />
          <span className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
            <HardHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Helmet reminder: Verified drivers carry a spare ISI helmet, and riders wear a helmet for the entire trip.
            </span>
          </span>
        </label>
      </div>

      {error ? (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-display font-bold text-sm shadow-sm transition active:scale-[0.98]"
      >
        Confirm Pre-Booking · ₹{selectedRoute.basePrice} Fixed
      </button>

      <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
        <span>Share Ride & Campus SOS enabled immediately on confirmation</span>
      </p>
    </form>
  );
}
