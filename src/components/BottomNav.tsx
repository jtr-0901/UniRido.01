import { Bike, CalendarCheck2, Home, ShieldCheck, User } from 'lucide-react';
import { AnyUser, AppScreen } from '../types/unirido';

interface BottomNavProps {
  currentScreen: AppScreen;
  currentUser: AnyUser;
  onNavigate: (screen: AppScreen) => void;
}

export function BottomNav({ currentScreen, currentUser, onNavigate }: BottomNavProps) {
  const isDriver = currentUser.role === 'driver';
  const isAdmin = currentUser.role === 'admin';

  const items: Array<{
    id: AppScreen;
    label: string;
    icon: typeof Home;
  }> = isAdmin
    ? [
        { id: 'admin-dashboard', label: 'Admin', icon: ShieldCheck },
        { id: 'rider-home', label: 'Routes', icon: Home },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    : isDriver
      ? [
          { id: 'driver-dashboard', label: 'Home', icon: Bike },
          { id: 'my-rides', label: 'My Rides', icon: CalendarCheck2 },
          { id: 'profile', label: 'Profile', icon: User },
        ]
      : [
          { id: 'rider-home', label: 'Home', icon: Home },
          { id: 'my-rides', label: 'My Rides', icon: CalendarCheck2 },
          { id: 'profile', label: 'Profile', icon: User },
        ];

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-3 h-[62px] items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            currentScreen === item.id ||
            (item.id === 'rider-home' && currentScreen === 'book-ride');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition ${
                active
                  ? 'text-[#0F766E] font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.3 : 1.9} />
              <span className="text-[11px] leading-none whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
