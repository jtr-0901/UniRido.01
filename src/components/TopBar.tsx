import { ArrowLeft, ShieldAlert, UserCheck } from 'lucide-react';
import { AnyUser, AppScreen } from '../types/unirido';

interface TopBarProps {
  currentScreen: AppScreen;
  currentUser: AnyUser | null;
  onNavigate: (screen: AppScreen) => void;
  onOpenRoleSwitcher: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({
  currentScreen,
  currentUser,
  onNavigate,
  onOpenRoleSwitcher,
  showBack,
  onBack,
}: TopBarProps) {
  const screenTitles: Record<AppScreen, string> = {
    landing: 'UniRido',
    auth: 'Student Sign In',
    verification: 'Student Verification',
    'rider-home': 'Morning Routes',
    'book-ride': 'Pre-Book Ride',
    'my-rides': 'My Rides',
    'driver-dashboard': 'Driver Console',
    'admin-dashboard': 'Pilot Admin',
    profile: 'Account & Safety',
  };

  const isLanding = currentScreen === 'landing';

  return (
    <header className="sticky top-0 z-30 h-[54px] bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-[0.97] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() =>
            onNavigate(
              currentUser
                ? currentUser.role === 'driver'
                  ? 'driver-dashboard'
                  : currentUser.role === 'admin'
                    ? 'admin-dashboard'
                    : 'rider-home'
                : 'landing'
            )
          }
          className="text-left min-h-[44px] flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-teal-700 rounded-lg"
        >
          <span className="w-7 h-7 rounded-lg bg-[#0F766E] text-white font-display font-bold text-sm flex items-center justify-center shrink-0">
            U
          </span>
          <span className="font-display font-bold text-[17px] tracking-tight text-slate-900 whitespace-nowrap truncate">
            {isLanding ? 'UniRido' : screenTitles[currentScreen]}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {currentUser ? (
          <button
            type="button"
            onClick={onOpenRoleSwitcher}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="capitalize">{currentUser.role}</span>
          </button>
        ) : currentScreen !== 'auth' ? (
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition active:scale-[0.98]"
          >
            Sign In
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenRoleSwitcher}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Demo Roles</span>
          </button>
        )}
      </div>
    </header>
  );
}
