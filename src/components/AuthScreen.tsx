import { useState } from 'react';
import { AlertCircle, Bike, GraduationCap, ShieldCheck } from 'lucide-react';
import { AnyUser } from '../types/unirido';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  initialRole?: 'rider' | 'driver';
  onLogin: (
    email: string,
    password: string
  ) => { ok: true } | { ok: false; error: string };
  onSignUp: (input: {
    name: string;
    email: string;
    phone: string;
    usn: string;
    role: 'rider' | 'driver';
    password: string;
  }) => { ok: true } | { ok: false; error: string };
  demoUsers: AnyUser[];
  onSwitchDemoUser: (userId: string) => void;
}

export function AuthScreen({
  initialMode = 'signup',
  initialRole = 'rider',
  onLogin,
  onSignUp,
  demoUsers,
  onSwitchDemoUser,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'rider' | 'driver'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const res = onLogin(email, password);
      if (!res.ok) setError(res.error);
      return;
    }

    const res = onSignUp({
      name,
      email,
      phone,
      usn,
      role,
      password,
    });
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl text-slate-900">
          {mode === 'signup' ? 'Join the REVA Pilot' : 'Welcome back'}
        </h1>
        <p className="text-sm text-slate-600">
          Verified REVA University students only (<span className="font-mono text-xs">@reva.edu.in</span> or <span className="font-mono text-xs">.edu.in</span>).
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
          className={`min-h-[44px] rounded-lg text-sm font-semibold transition ${
            mode === 'signup'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`min-h-[44px] rounded-lg text-sm font-semibold transition ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Log In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        {mode === 'signup' ? (
          <>
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-700">
                I want to join as a
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('rider')}
                  className={`min-h-[52px] p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    role === 'rider'
                      ? 'border-[#0F766E] bg-teal-50/70 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <GraduationCap
                    className={`w-5 h-5 shrink-0 ${
                      role === 'rider' ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold leading-tight">Rider</p>
                    <p className="text-[11px] text-slate-500">Book a seat</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`min-h-[52px] p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    role === 'driver'
                      ? 'border-[#0F766E] bg-teal-50/70 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Bike
                    className={`w-5 h-5 shrink-0 ${
                      role === 'driver' ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold leading-tight">Driver</p>
                    <p className="text-[11px] text-slate-500">Share my ride</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="auth-usn" className="block text-xs font-semibold text-slate-700">
                  REVA USN
                </label>
                <input
                  id="auth-usn"
                  type="text"
                  required
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="R23CS108"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-phone" className="block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700">
            REVA University Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@reva.edu.in"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-pass" className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          <input
            id="auth-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
          />
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
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-display font-semibold text-sm transition active:scale-[0.98]"
        >
          {mode === 'signup' ? 'Continue to ID Verification' : 'Sign In to UniRido'}
        </button>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Non-REVA emails (Gmail, Yahoo, etc.) are blocked</span>
        </p>
      </form>

      {/* Instant Demo Login */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-slate-600">
          Or sign in immediately with a seeded pilot account:
        </p>
        <div className="grid grid-cols-1 gap-2">
          {demoUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSwitchDemoUser(u.id)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0F766E] flex items-center justify-between gap-3 text-left transition"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{u.email}</p>
              </div>
              <span className="text-xs font-semibold text-[#0F766E] capitalize whitespace-nowrap shrink-0">
                {u.role} · {u.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
