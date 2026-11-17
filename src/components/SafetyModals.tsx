import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Phone,
  PhoneOff,
  Share2,
  ShieldAlert,
  Volume2,
  X,
} from 'lucide-react';
import { AnyUser, Driver, Ride, Route } from '../types/unirido';
import { formatRideDate } from '../services/dataService';

interface SOSModalProps {
  open: boolean;
  ride: Ride | null;
  route?: Route;
  driver?: Driver | null;
  onClose: () => void;
}

export function SOSModal({ open, ride, route, driver, onClose }: SOSModalProps) {
  const [step, setStep] = useState<'confirm' | 'calling'>('confirm');
  const [seconds, setSeconds] = useState(0);
  const [speaker, setSpeaker] = useState(true);

  useEffect(() => {
    if (!open) {
      setStep('confirm');
      setSeconds(0);
      return;
    }
    if (step !== 'calling') return;
    const timer = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, step]);

  if (!open) return null;

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency SOS"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
        {step === 'confirm' ? (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900">
                    Campus Emergency SOS
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Alerts REVA Campus Security & Emergency Helpline (112)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close SOS dialog"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                Ride details shared with Campus Security:
              </p>
              <p className="text-slate-600">
                {route ? route.name : 'REVA Morning Commute'}
              </p>
              {ride ? (
                <p className="text-slate-600 font-mono text-xs tabular-nums">
                  {formatRideDate(ride.date)} · {ride.timeSlot} · {ride.pickupPoint}
                </p>
              ) : null}
              {driver ? (
                <p className="text-slate-700 text-xs">
                  Driver: <span className="font-semibold">{driver.name}</span> ({driver.bikeNumber})
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setStep('calling')}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Call REVA Security & Trigger SOS</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-white p-6 space-y-6">
            <div className="flex items-center justify-between text-xs text-red-300 font-medium">
              <span>Emergency Call Active (Simulated Pilot SOS)</span>
              <span className="font-mono tabular-nums">
                {mins}:{secs}
              </span>
            </div>

            <div className="py-4 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl">
                REVA Campus Security Desk
              </h3>
              <p className="text-sm text-slate-300 font-mono tabular-nums">
                +91 80 4696 6966 · Dial 112 Backup Ready
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Ride ID {ride?.id ?? 'Active'} ·{' '}
                {driver ? `${driver.name} (${driver.bikeNumber})` : 'Route Pilot Dispatch'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSpeaker((v) => !v)}
                className={`min-h-[48px] rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border transition ${
                  speaker
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{speaker ? 'Speaker On' : 'Speaker Off'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] rounded-xl px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ShareRideModalProps {
  open: boolean;
  ride: Ride | null;
  route?: Route;
  driver?: Driver | null;
  rider?: AnyUser | null;
  onClose: () => void;
}

export function ShareRideModal({
  open,
  ride,
  route,
  driver,
  rider,
  onClose,
}: ShareRideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !ride) return null;

  const shareUrl = `https://unirido.reva.pilot/trip/${ride.id}`;
  const summaryText = [
    `UniRido REVA Campus Ride (${formatRideDate(ride.date)}, ${ride.timeSlot})`,
    `Student: ${rider?.name ?? 'REVA Student'} (${rider?.usn ?? 'Verified'})`,
    `Route: ${route?.name ?? ride.routeId}`,
    `Pickup: ${ride.pickupPoint} -> REVA University`,
    driver
      ? `Driver: ${driver.name} · Bike: ${driver.bikeNumber} (${driver.bikeModel})`
      : 'Driver: Pending Pilot Assignment',
    `Fixed Fuel Share: ₹${ride.price}`,
    `Trip Ref: ${shareUrl}`,
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Ride Details"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Share Ride Details
              </h2>
              <p className="text-xs text-slate-600">
                Send your morning bike pool details to parents or friends
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Share dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 whitespace-pre-line font-mono leading-relaxed">
          {summaryText}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Ride Details Copied' : 'Copy Share Link & Summary'}</span>
        </button>
      </div>
    </div>
  );
}

interface ReportModalProps {
  open: boolean;
  rideId: string | null;
  onSubmit: (category: string, details: string) => void;
  onClose: () => void;
}

const REPORT_CATEGORIES = [
  'Helmet not provided',
  'Driver / Rider no-show',
  'Late pickup (> 10 mins)',
  'Safety or driving concern',
  'Payment or fare issue',
];

export function ReportProblemModal({
  open,
  rideId,
  onSubmit,
  onClose,
}: ReportModalProps) {
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(category, details || 'Reported via UniRido Pilot safety form');
    setSubmitted(true);
    window.setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report a Problem"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Report a Problem
              </h2>
              <p className="text-xs text-slate-600">
                {rideId ? `Ride ${rideId} · ` : ''}Reviewed directly by the campus pilot founder
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-900">Report logged for founder review</p>
            <p className="text-xs text-slate-600">
              Thank you for keeping the REVA pilot safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="report-category" className="block text-xs font-semibold text-slate-700">
                Issue Type
              </label>
              <select
                id="report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              >
                {REPORT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="report-notes" className="block text-xs font-semibold text-slate-700">
                What happened?
              </label>
              <textarea
                id="report-notes"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share pickup point, time, or issue details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition active:scale-[0.98]"
            >
              Submit Safety Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface DocPreviewModalProps {
  user: AnyUser | null;
  onClose: () => void;
}

export function DocPreviewModal({ user, onClose }: DocPreviewModalProps) {
  if (!user) return null;
  const driver = user.role === 'driver' ? (user as Driver) : null;

  const docs = [
    { label: 'REVA College ID', value: user.collegeIdUrl || 'Not uploaded yet' },
    ...(driver
      ? [
          { label: 'Driving Licence', value: driver.licenceUrl || 'Not uploaded yet' },
          { label: 'Vehicle RC', value: driver.rcUrl || 'Not uploaded yet' },
          { label: 'Insurance Policy', value: driver.insuranceUrl || 'Not uploaded yet' },
        ]
      : []),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Submitted Documents"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 border border-slate-200 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              {user.name}
            </h2>
            <p className="text-xs text-slate-600 font-mono">
              {user.usn} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document preview"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {driver ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
            <p>
              Bike: <span className="font-semibold">{driver.bikeModel || '—'}</span> ·{' '}
              <span className="font-mono">{driver.bikeNumber || '—'}</span>
            </p>
            <p>
              Pillion Helmet Confirmed:{' '}
              <span className="font-semibold">{driver.helmetConfirmed ? 'Yes' : 'No'}</span>
            </p>
          </div>
        ) : null}

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
          {docs.map((doc) => {
            const isDataImage = doc.value.startsWith('data:image');
            return (
              <div
                key={doc.label}
                className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{doc.label}</p>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    {isDataImage ? 'Uploaded image photo' : doc.value}
                  </p>
                </div>
                {isDataImage ? (
                  <img
                    src={doc.value}
                    alt={doc.label}
                    referrerPolicy="no-referrer"
                    className="w-14 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
