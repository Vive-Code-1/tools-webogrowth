import { useEffect, useState } from "react";

interface Props {
  /** Seconds until expiration. Default 300 (5 minutes). */
  duration?: number;
  /** Active = countdown running. When false, panel hides. */
  active: boolean;
  /** Re-key to restart the countdown (e.g. Date.now() of last conversion). */
  resetKey?: number | string;
  /** Called once when timer hits zero. Tools should revoke blob URLs / clear results. */
  onExpire: () => void;
  /** Optional re-run handler shown in the expired state. */
  onReconvert?: () => void;
  /** Optional label override. */
  label?: string;
}

const ResultCountdownPanel = ({
  duration = 300,
  active,
  resetKey,
  onExpire,
  onReconvert,
  label = "ডাউনলোড উইন্ডো",
}: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [expired, setExpired] = useState(false);

  // Reset on key change / when activated.
  useEffect(() => {
    if (!active) return;
    setSecondsLeft(duration);
    setExpired(false);
  }, [active, resetKey, duration]);

  useEffect(() => {
    if (!active || expired) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setExpired(true);
          onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, expired, onExpire]);

  if (!active) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = (secondsLeft / duration) * 100;

  if (expired) {
    return (
      <div className="bg-destructive/10 border border-destructive/40 rounded-xl p-5 text-center space-y-3">
        <span className="material-symbols-outlined text-destructive text-3xl">timer_off</span>
        <h4 className="font-headline font-bold text-destructive">Download window expired</h4>
        <p className="text-xs text-on-surface-variant">
          ফাইলগুলো ব্রাউজার থেকে মুছে ফেলা হয়েছে। আবার ডাউনলোড করতে হলে নতুন করে প্রসেস করুন।
        </p>
        {onReconvert && (
          <button
            onClick={onReconvert}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined">refresh</span>
            আবার প্রসেস করুন
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">timer</span>
          <span className="font-headline font-bold text-lg">
            {mm}:{ss}
          </span>
        </div>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
          {label}
        </span>
      </div>
      <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
        ৫ মিনিটের মধ্যে ডাউনলোড করুন। সময় শেষ হলে ফাইল মুছে যাবে — আবার প্রসেস করতে হবে।
      </p>
    </div>
  );
};

export default ResultCountdownPanel;
