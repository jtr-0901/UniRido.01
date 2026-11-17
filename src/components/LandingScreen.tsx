import { useState } from 'react';
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AnyUser } from '../types/unirido';

interface LandingScreenProps {
  onBookRideCTA: () => void;
  onBecomeDriverCTA: () => void;
  onJoinWaitlist: (entry: {
    name: string;
    email: string;
    area: string;
    preferredTime: string;
  }) => { ok: true } | { ok: false; error: string };
  demoUsers: AnyUser[];
  onSwitchDemoUser: (userId: string) => void;
}

export function LandingScreen({
  onBookRideCTA,
  onBecomeDriverCTA,
  onJoinWaitlist,
  demoUsers,
  onSwitchDemoUser,
}: LandingScreenProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [campusImgFailed, setCampusImgFailed] = useState(false);

  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlArea, setWlArea] = useState('');
  const [wlTime, setWlTime] = useState('8:00 AM');
  const [wlStatus, setWlStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onJoinWaitlist({
      name: wlName,
      email: wlEmail,
      area: wlArea,
      preferredTime: wlTime,
    });
    if (!res.ok) {
      setWlStatus({ type: 'err', msg: res.error });
      return;
    }
    setWlStatus({
      type: 'ok',
      msg: 'Added to route expansion waitlist. We will email your REVA inbox when your area opens.',
    });
    setWlName('');
    setWlEmail('');
    setWlArea('');
  };

  return (
    <div className="pb-12">
      {/* Editorial Hero */}
      <section className="px-4 pt-5 pb-6 space-y-5">
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[#0F766E] tracking-tight">
            REVA University Campus Pilot · 3 Morning Routes · Daytime Pre-Book Only
          </p>
          <h1 className="font-display font-extrabold text-[28px] leading-[1.15] tracking-tight text-slate-900 text-balance">
            Ride with a fellow REVA student, already going your way
          </h1>
          <p className="text-[15px] leading-[1.55] text-slate-600">
            Campus buses run rigid schedules and autos overcharge for short morning hops.
            Share an empty pillion seat with a verified classmate commuting on the same road.
          </p>
        </div>

        {/* Hero Photography */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9]">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/unirido_hero_commute_1794911197819.jpg"
              alt="Commuter motorcycle with two helmets on a sunlit North Bengaluru morning avenue"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-900 to-slate-800 flex flex-col items-center justify-center text-white p-6 text-center">
              <Bike className="w-9 h-9 text-amber-400 mb-2" />
              <p className="font-display font-semibold text-sm">
                REVA Morning Bike Pool · North Bengaluru
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-4 py-3 text-white">
            <p className="text-xs font-medium text-white/95">
              Verified REVA Student Only · Fixed Price, No Surge · Share Ride Enabled
            </p>
          </div>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onBookRideCTA}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <span>Book a Ride</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onBecomeDriverCTA}
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-display font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Bike className="w-4 h-4" />
            <span>Become a Driver</span>
          </button>
        </div>

        {/* Fixed Pilot Pricing Snapshot */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 border-b border-slate-100">
            <span className="font-semibold text-slate-800">Active Pilot Corridors</span>
            <span className="font-mono tabular-nums">7:30 AM – 8:45 AM</span>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-800 font-medium">Route A · Hennur</span>
              <span className="font-mono font-semibold text-[#0F766E] tabular-nums">
                ₹20 fixed
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-800 font-medium">Route B · Kalyan Nagar</span>
              <span className="font-mono font-semibold text-[#0F766E] tabular-nums">
                ₹25 fixed
              </span>
            </div>
            <div className="pt-2.5 flex items-center justify-between gap-2">
              <span className="text-slate-800 font-medium">Route C · Yelahanka</span>
              <span className="font-mono font-semibold text-[#0F766E] tabular-nums">
                ₹20 fixed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 3 Steps */}
      <section className="px-4 py-6 border-t border-slate-200 bg-white space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-900">
          How the pilot works
        </h2>
        <ol className="space-y-4">
          <li className="flex gap-3.5">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] font-mono font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
              01
            </span>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Verify with your REVA ID
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Sign up using your <span className="font-mono">@reva.edu.in</span> email and upload your College ID. Drivers also submit Driving Licence, RC, and Insurance.
              </p>
            </div>
          </li>
          <li className="flex gap-3.5">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] font-mono font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
              02
            </span>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Pre-book tomorrow’s slot
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Pick one of 3 morning routes, a fixed pickup point, and your class-time slot. No instant taxi dispatch or surge fares.
              </p>
            </div>
          </li>
          <li className="flex gap-3.5">
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] font-mono font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
              03
            </span>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Helmet on, share fuel cost
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                Meet at the pickup stop on time, share your ride link with family, and pay driver by UPI / Cash on ride (₹20–₹25).
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Safety & Campus Image */}
      <section className="px-4 py-6 border-t border-slate-200 space-y-4">
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
            {!campusImgFailed ? (
              <img
                src="/src/assets/images/unirido_campus_gate_1794911198541.jpg"
                alt="Students walking along REVA University campus avenue in morning light"
                referrerPolicy="no-referrer"
                onError={() => setCampusImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-teal-900 flex items-center justify-center text-white text-sm font-medium">
                REVA University Main Gate Drop-off
              </div>
            )}
          </div>
          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[#0F766E]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h2 className="font-display font-bold text-sm text-slate-900">
                Built for student safety, not commercial scale
              </h2>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                <span>Manual founder review of every student USN, Licence, RC & Insurance</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                <span>Daytime morning pilot only (7:30 AM – 8:45 AM), zero late-night rides</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                <span>Capped at 10 verified student drivers & ~100 pilot riders</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Route Waitlist */}
      <section className="px-4 py-6 border-t border-slate-200 bg-white space-y-3">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900">
            Not on Routes A, B, or C?
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Join the student waitlist to vote for Jakkur, Hebbal, or RT Nagar next.
          </p>
        </div>

        <form onSubmit={handleWaitlistSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={wlName}
              onChange={(e) => setWlName(e.target.value)}
              placeholder="Your name"
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
            <input
              type="text"
              required
              value={wlArea}
              onChange={(e) => setWlArea(e.target.value)}
              placeholder="Area (e.g. Jakkur)"
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <input
              type="email"
              required
              value={wlEmail}
              onChange={(e) => setWlEmail(e.target.value)}
              placeholder="you@reva.edu.in"
              className="col-span-2 min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            />
            <select
              value={wlTime}
              onChange={(e) => setWlTime(e.target.value)}
              aria-label="Preferred morning slot"
              className="min-h-[44px] px-2.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
            >
              <option value="7:30 AM">7:30 AM</option>
              <option value="8:00 AM">8:00 AM</option>
              <option value="8:30 AM">8:30 AM</option>
            </select>
          </div>
          {wlStatus ? (
            <p
              className={`text-xs font-medium ${
                wlStatus.type === 'ok' ? 'text-[#0F766E]' : 'text-red-600'
              }`}
            >
              {wlStatus.msg}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition"
          >
            Join Route Waitlist
          </button>
        </form>
      </section>

      {/* Quick Pilot Demo Switcher */}
      <section className="px-4 pt-6 border-t border-slate-200 space-y-2.5">
        <p className="text-xs font-semibold text-slate-700">
          Quick Pilot Walkthrough (1-Tap Demo Accounts)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {demoUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSwitchDemoUser(u.id)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#0F766E] text-left transition"
            >
              <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">
                {u.role} · {u.status}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
