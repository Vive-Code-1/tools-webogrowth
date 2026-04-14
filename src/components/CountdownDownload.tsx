import { useState, useEffect, useCallback } from "react";
import { deleteProcessedFile } from "@/lib/storage";

interface CountdownDownloadProps {
  downloadUrl: string | null;
  fileName: string;
  onExpired: () => void;
}

const COUNTDOWN_SECONDS = 300; // 5 minutes

const CountdownDownload = ({ downloadUrl, fileName, onExpired }: CountdownDownloadProps) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [expired, setExpired] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!downloadUrl) return;
    setSecondsLeft(COUNTDOWN_SECONDS);
    setExpired(false);
    setDownloaded(false);
  }, [downloadUrl]);

  useEffect(() => {
    if (!downloadUrl || expired) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          // Delete from Supabase storage if it's a Supabase URL
          if (downloadUrl.includes("supabase")) {
            deleteProcessedFile(downloadUrl);
          }
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [downloadUrl, expired, onExpired]);

  const handleDownload = useCallback(async () => {
    if (!downloadUrl || expired) return;
    
    try {
      // For Supabase URLs, fetch and download as blob
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(blobUrl);
      setDownloaded(true);
    } catch {
      // Fallback: direct link
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      a.click();
      setDownloaded(true);
    }
  }, [downloadUrl, expired, fileName]);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = (secondsLeft / COUNTDOWN_SECONDS) * 100;

  if (!downloadUrl) return null;

  return (
    <div className="bg-surface-container rounded-xl p-6 space-y-4">
      {expired ? (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-destructive text-3xl">timer_off</span>
          </div>
          <h4 className="font-headline font-bold text-lg text-destructive">সময় শেষ!</h4>
          <p className="text-on-surface-variant text-sm">আবার নতুন করে ইমেজ প্রসেস করুন</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">timer</span>
              <span className="font-headline font-bold text-lg">
                {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label font-bold">
              Download Window
            </span>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-primary text-on-primary font-bold py-4 rounded-lg flex items-center justify-center gap-3 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">download</span>
            {downloaded ? "Download Again" : "Download Now"}
          </button>
        </>
      )}
    </div>
  );
};

export default CountdownDownload;
