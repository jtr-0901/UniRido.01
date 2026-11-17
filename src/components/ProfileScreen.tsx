import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { AnyUser, Driver } from '../types/unirido';

interface ProfileScreenProps {
  user: AnyUser;
  allUsers: AnyUser[];
  onOpenVerification: () => void;
  onReportProblem: () => void;
  onSwitchUser: (userId: string) => void;
  onResetPilotData: () => void;
  onLogout: () => void;
}

export function ProfileScreen({
  user,
  allUsers,
  onOpenVerification,
  onReportProblem,
  onSwitchUser,
  onResetPilotData,
  onLogout,
}: ProfileScreenProps) {
  const driver = user.role === 'driver' ? (user as Driver) : null;

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      {/* Student Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#0F766E] capitalize">
              REVA {user.role} Account
            </p>
            <h1 className="font-display font-bold text-xl text-slate-900 mt-0.5">
              {user.name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user.usn} · {user.email}
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums">
            ★ {user.rating.toFixed(1)}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 flex items-center gap-1.5">
            {user.status === 'verified' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                <span className="font-semibold text-[#0F766E]">Verified REVA Student</span>
              </>
            ) : user.status === 'rejected' ? (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-700">Verification Rejected</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800">Verification Pending</span>
              </>
            )}
          </span>

          <button
            type="button"
            onClick={onOpenVerification}
            className="text-[#0F766E] font-semibold hover:underline flex items-center gap-1 min-h-[36px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents</span>
          </button>
        </div>

        {driver ? (
          <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>{driver.bikeModel || 'Vehicle not added'}</span>
            <span className="font-mono font-semibold text-slate-800">
              {driver.bikeNumber || '—'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Safety & Pilot Rules */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        <button
          type="button"
          onClick={onReportProblem}
          className="w-full min-h-[52px] px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Report a Problem</span>
          </span>
          <span className="text-xs text-slate-500">Safety Desk</span>
        </button>

        <div className="px-4 py-3 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <span>
            Pilot scope: Daytime morning commutes only (7:30–8:45 AM), fixed fuel cost-share paid directly to driver via UPI or Cash.
          </span>
        </div>
      </div>

      {/* Pilot Account Switcher */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Switch Active Pilot Account (For Testing Flows)</span>
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {allUsers.map((u) => {
            const isCurrent = u.id === user.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSwitchUser(u.id)}
                className={`w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between text-left transition ${
                  isCurrent ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {u.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {u.usn} · {u.email}
                  </p>
                </div>
                <span className="text-[11px] font-semibold capitalize text-[#0F766E] shrink-0 ml-2">
                  {isCurrent ? 'Active' : `${u.role} (${u.status})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset & Sign Out */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onResetPilotData}
          className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Mock Data</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
