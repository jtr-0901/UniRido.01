import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldAlert,
  Upload,
  XCircle,
} from 'lucide-react';
import { AnyUser, Driver, Route } from '../types/unirido';

interface VerificationScreenProps {
  user: AnyUser;
  routes: Route[];
  onSubmitDocs: (payload: {
    collegeIdUrl: string;
    licenceUrl?: string;
    rcUrl?: string;
    insuranceUrl?: string;
    bikeNumber?: string;
    bikeModel?: string;
    helmetConfirmed?: boolean;
    preferredRouteId?: string;
  }) => void;
  onContinue: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || file.name));
    reader.onerror = () => resolve(file.name);
    reader.readAsDataURL(file);
  });
}

export function VerificationScreen({
  user,
  routes,
  onSubmitDocs,
  onContinue,
}: VerificationScreenProps) {
  const isDriver = user.role === 'driver';
  const driver = isDriver ? (user as Driver) : null;

  const [collegeIdUrl, setCollegeIdUrl] = useState(user.collegeIdUrl || '');
  const [licenceUrl, setLicenceUrl] = useState(driver?.licenceUrl || '');
  const [rcUrl, setRcUrl] = useState(driver?.rcUrl || '');
  const [insuranceUrl, setInsuranceUrl] = useState(driver?.insuranceUrl || '');
  const [bikeNumber, setBikeNumber] = useState(driver?.bikeNumber || '');
  const [bikeModel, setBikeModel] = useState(driver?.bikeModel || '');
  const [helmetConfirmed, setHelmetConfirmed] = useState(
    driver?.helmetConfirmed ?? false
  );
  const [preferredRouteId, setPreferredRouteId] = useState(
    driver?.preferredRouteId || 'route-a'
  );
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!collegeIdUrl) {
      setError('Please upload your REVA College ID photo.');
      return;
    }
    if (isDriver) {
      if (!licenceUrl || !rcUrl || !insuranceUrl) {
        setError('Drivers must upload Driving Licence, Vehicle RC, and Insurance.');
        return;
      }
      if (!bikeNumber.trim() || !bikeModel.trim()) {
        setError('Enter your bike registration number and model.');
        return;
      }
      if (!helmetConfirmed) {
        setError('Please confirm you carry a spare ISI helmet for your fellow student.');
        return;
      }
    }

    onSubmitDocs({
      collegeIdUrl,
      licenceUrl,
      rcUrl,
      insuranceUrl,
      bikeNumber,
      bikeModel,
      helmetConfirmed,
      preferredRouteId,
    });
    setSavedNotice(true);
  };

  const statusMeta = {
    verified: {
      icon: CheckCircle2,
      title: 'Verified REVA Student',
      desc: isDriver
        ? 'Your College ID, Licence, RC & Insurance are verified. You can accept rides.'
        : 'Your REVA student status is verified. Pre-book any morning pilot route.',
      boxClass: 'bg-teal-50 border-teal-200 text-teal-900',
      iconClass: 'text-[#0F766E]',
    },
    pending: {
      icon: Clock,
      title: 'Verification Pending Founder Review',
      desc: isDriver
        ? 'Drivers cannot accept rides until the pilot admin verifies your documents.'
        : 'You can already pre-book Route A/B/C for tomorrow while your ID is reviewed.',
      boxClass: 'bg-amber-50 border-amber-200 text-amber-950',
      iconClass: 'text-amber-600',
    },
    rejected: {
      icon: XCircle,
      title: 'Verification Rejected — Re-upload Required',
      desc: 'One or more uploaded photos were unclear or mismatched your USN. Please re-submit.',
      boxClass: 'bg-red-50 border-red-200 text-red-900',
      iconClass: 'text-red-600',
    },
  }[user.status];

  const StatusIcon = statusMeta.icon;

  const renderUploadField = (
    id: string,
    label: string,
    value: string,
    setter: (v: string) => void,
    sampleName: string
  ) => (
    <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-slate-800">
          {label}
        </label>
        {value ? (
          <span className="text-[11px] font-medium text-[#0F766E] flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Attached</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setter(sampleName)}
            className="text-[11px] font-medium text-[#0F766E] hover:underline min-h-[28px] px-1"
          >
            Attach sample photo
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="flex-1 min-h-[44px] px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-[#0F766E] bg-slate-50 text-xs text-slate-600 flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="truncate">
            {value
              ? value.startsWith('data:image')
                ? 'Photo selected from device'
                : value
              : 'Tap to upload image'}
          </span>
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setter)}
          className="sr-only"
        />
      </div>
    </div>
  );

  return (
    <div className="px-4 py-5 space-y-5 pb-24">
      {/* Verification Status Card */}
      <div className={`border rounded-2xl p-4 flex items-start gap-3 ${statusMeta.boxClass}`}>
        <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${statusMeta.iconClass}`} />
        <div className="space-y-1">
          <h2 className="font-display font-bold text-sm">{statusMeta.title}</h2>
          <p className="text-xs opacity-90 leading-relaxed">{statusMeta.desc}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-lg text-slate-900">
            {isDriver ? 'Driver Onboarding Documents' : 'Student ID Verification'}
          </h1>
          <p className="text-xs text-slate-600">
            {user.name} · <span className="font-mono">{user.usn}</span>
          </p>
        </div>

        {renderUploadField(
          'doc-college-id',
          'REVA College ID Card (Front)',
          collegeIdUrl,
          setCollegeIdUrl,
          `reva_id_${user.usn}.jpg`
        )}

        {isDriver ? (
          <>
            {renderUploadField(
              'doc-licence',
              'Valid Two-Wheeler Driving Licence',
              licenceUrl,
              setLicenceUrl,
              `dl_${user.usn}.jpg`
            )}
            {renderUploadField(
              'doc-rc',
              'Vehicle Registration Certificate (RC)',
              rcUrl,
              setRcUrl,
              `rc_${user.usn}.jpg`
            )}
            {renderUploadField(
              'doc-insurance',
              'Active Two-Wheeler Insurance',
              insuranceUrl,
              setInsuranceUrl,
              `insurance_${user.usn}.jpg`
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="bike-num" className="block text-xs font-semibold text-slate-700">
                    Bike Number
                  </label>
                  <input
                    id="bike-num"
                    type="text"
                    value={bikeNumber}
                    onChange={(e) => setBikeNumber(e.target.value)}
                    placeholder="KA-04-JY-4821"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="bike-model" className="block text-xs font-semibold text-slate-700">
                    Bike / Scooter Model
                  </label>
                  <input
                    id="bike-model"
                    type="text"
                    value={bikeModel}
                    onChange={(e) => setBikeModel(e.target.value)}
                    placeholder="Honda Activa 6G"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="pref-route" className="block text-xs font-semibold text-slate-700">
                  Your Regular Morning Route
                </label>
                <select
                  id="pref-route"
                  value={preferredRouteId}
                  onChange={(e) => setPreferredRouteId(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-3 pt-1 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={helmetConfirmed}
                  onChange={(e) => setHelmetConfirmed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm I carry a spare ISI-certified pillion helmet for my co-rider on every morning trip.
                </span>
              </label>
            </div>
          </>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        {savedNotice ? (
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium">
            Documents saved with status: <span className="font-semibold">Pending</span>. You can proceed to the pilot dashboard now.
          </div>
        ) : null}

        <div className="space-y-2.5 pt-1">
          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-display font-semibold text-sm transition active:scale-[0.98]"
          >
            Submit Documents for Verification
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition"
          >
            {isDriver ? 'Go to Driver Console' : 'Continue to Route List'}
          </button>
        </div>
      </form>
    </div>
  );
}
