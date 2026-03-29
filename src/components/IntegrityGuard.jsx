import { Shield, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayIntegrity, INTEGRITY_STATUS } from '@/hooks/usePlayIntegrity';

/**
 * IntegrityGuard
 *
 * Wraps any content that should only be rendered after a successful Google
 * Play Integrity check.  While the check is in progress, a loading spinner
 * is shown.  If the device fails the check, a blocking error screen is
 * displayed with a retry button.
 *
 * On non-Android environments (browser, desktop) the check resolves as
 * "unavailable" and the children are rendered normally, so web users are
 * never blocked.
 *
 * Usage:
 *   <IntegrityGuard>
 *     <YourProtectedPage />
 *   </IntegrityGuard>
 *
 * Props:
 *   children       – content to render when integrity is confirmed
 *   fallback       – optional custom element to render instead of the default
 *                    error screen when the check fails
 */
export default function IntegrityGuard({ children, fallback }) {
  const { status, error, checkIntegrity } = usePlayIntegrity();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === INTEGRITY_STATUS.IDLE || status === INTEGRITY_STATUS.CHECKING) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
        <Shield className="w-10 h-10 text-emerald-400 animate-pulse" />
        <p className="text-white/60 text-sm">Verifying app integrity…</p>
      </div>
    );
  }

  // ── Verified or unavailable (non-Android env) ─────────────────────────────
  if (status === INTEGRITY_STATUS.VERIFIED || status === INTEGRITY_STATUS.UNAVAILABLE) {
    return <>{children}</>;
  }

  // ── Failed or error ───────────────────────────────────────────────────────
  if (fallback) return <>{fallback}</>;

  const isFailed = status === INTEGRITY_STATUS.FAILED;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-zinc-950 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-white font-semibold text-lg">
          {isFailed ? 'Integrity Check Failed' : 'Verification Error'}
        </h2>
        <p className="text-white/50 text-sm max-w-xs">
          {isFailed
            ? 'This app could not be verified as genuine. Please install it from the Google Play Store and ensure your device has not been modified.'
            : (error ?? 'An unexpected error occurred while verifying this app.')}
        </p>
      </div>

      <Button
        onClick={checkIntegrity}
        className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>

      {!isFailed && (
        <p className="text-white/30 text-xs">
          If this problem persists, please reinstall the app from Google Play.
        </p>
      )}
    </div>
  );
}

/**
 * IntegrityBadge
 *
 * Small inline badge showing the current integrity status.
 * Useful in settings screens or debug views.
 */
export function IntegrityBadge() {
  const { status, isAvailable } = usePlayIntegrity({ autoCheck: true });

  const configs = {
    [INTEGRITY_STATUS.IDLE]:        { icon: Shield,      color: 'text-white/40',   label: 'Pending' },
    [INTEGRITY_STATUS.CHECKING]:    { icon: Shield,      color: 'text-amber-400 animate-pulse', label: 'Checking…' },
    [INTEGRITY_STATUS.VERIFIED]:    { icon: ShieldCheck, color: 'text-emerald-400', label: 'Verified' },
    [INTEGRITY_STATUS.UNAVAILABLE]: { icon: ShieldCheck, color: 'text-blue-400',    label: 'Web Mode' },
    [INTEGRITY_STATUS.FAILED]:      { icon: ShieldAlert, color: 'text-red-400',     label: 'Failed' },
    [INTEGRITY_STATUS.ERROR]:       { icon: ShieldAlert, color: 'text-orange-400',  label: 'Error' },
  };

  const cfg = configs[status] ?? configs[INTEGRITY_STATUS.IDLE];
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
      {isAvailable && status === INTEGRITY_STATUS.VERIFIED && (
        <span className="text-white/30 font-normal"> · Play Integrity</span>
      )}
    </span>
  );
}
