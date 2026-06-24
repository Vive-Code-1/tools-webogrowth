import { useCallback, useRef, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import DropZone from "@/components/DropZone";
import ResultCountdownPanel from "@/components/ResultCountdownPanel";
import { useToast } from "@/hooks/use-toast";

const VideoToGif = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [duration, setDuration] = useState(0);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [format, setFormat] = useState<"gif" | "webm" | "mp4">("gif");
  const [output, setOutput] = useState<{ url: string; size: number; name: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<any>(null);

  const handleExpire = useCallback(() => {
    setOutput((cur) => {
      if (cur && cur.url.startsWith("blob:")) URL.revokeObjectURL(cur.url);
      return null;
    });
  }, []);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ff = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
    ff.on("progress", ({ progress }: { progress: number }) => setProgress(Math.round(progress * 100)));
    await ff.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ff;
    return ff;
  };

  const onFile = (f: File) => {
    setFile(f);
    setOutput(null);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  };

  const onLoadedMeta = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration;
    setDuration(d);
    setEnd(Math.min(d, 5));
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true); setOutput(null); setProgress(0);
    try {
      const ff = await loadFFmpeg();
      const { fetchFile } = await import("@ffmpeg/util");
      await ff.writeFile("input", await fetchFile(file));
      const dur = Math.max(0.1, end - start);
      const outName = `out.${format}`;
      const args = ["-ss", `${start}`, "-t", `${dur}`, "-i", "input"];
      if (format === "gif") {
        args.push("-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`, outName);
      } else if (format === "webm") {
        args.push("-vf", `fps=${fps},scale=${width}:-2`, "-c:v", "libvpx-vp9", "-b:v", "1M", "-an", outName);
      } else {
        args.push("-vf", `fps=${fps},scale=${width}:-2`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", outName);
      }
      await ff.exec(args);
      const data = await ff.readFile(outName);
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], {
        type: format === "gif" ? "image/gif" : `video/${format}`,
      });
      setOutput({ url: URL.createObjectURL(blob), size: blob.size, name: `${file.name.replace(/\.[^.]+$/, "")}.${format}` });
      setCountdownKey(Date.now());
      toast({ title: `Created ${format.toUpperCase()}`, description: "৫ মিনিটের মধ্যে ডাউনলোড করুন।" });
    } catch (e: any) {
      toast({ title: "Conversion failed", description: e.message, variant: "destructive" });
    } finally { setBusy(false); setProgress(0); }
  };

  return (
    <>
      <SEOHead {...getSeoProps("/video-to-gif")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Image Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            Video → GIF <br /><span className="text-secondary">/ WebM Converter</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Convert video clips to optimized GIF, WebM or MP4 with trimming, FPS and resolution control. Powered by FFmpeg in your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {!file && <DropZone accept="video/*" onFileSelect={onFile} label="Drop a video" sublabel="MP4, MOV, WebM up to 100MB" maxSizeMB={100} />}
            {videoUrl && (
              <div className="bg-surface-container rounded-xl p-4">
                <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" onLoadedMetadata={onLoadedMeta} />
                <p className="text-xs text-on-surface-variant mt-2">{file?.name} • {duration.toFixed(1)}s</p>
                <button onClick={() => { setFile(null); setVideoUrl(""); setOutput(null); }} className="text-xs text-destructive mt-2">Remove</button>
              </div>
            )}
            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">Start: {start.toFixed(1)}s</label>
                  <input type="range" min="0" max={duration} step="0.1" value={start} onChange={(e) => setStart(+e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">End: {end.toFixed(1)}s</label>
                  <input type="range" min="0" max={duration} step="0.1" value={end} onChange={(e) => setEnd(+e.target.value)} className="w-full" />
                </div>
              </div>
              <p className="text-xs text-primary">Clip: {Math.max(0, end - start).toFixed(1)}s</p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full bg-surface-container-lowest rounded-lg px-2 py-2 text-sm">
                    <option value="gif">GIF</option><option value="webm">WebM</option><option value="mp4">MP4</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">FPS</label>
                  <input type="number" min="5" max="30" value={fps} onChange={(e) => setFps(+e.target.value)} className="w-full bg-surface-container-lowest rounded-lg px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-1">Width</label>
                  <input type="number" step="10" value={width} onChange={(e) => setWidth(+e.target.value)} className="w-full bg-surface-container-lowest rounded-lg px-2 py-2 text-sm" />
                </div>
              </div>
            </div>

            <button onClick={convert} disabled={!file || busy} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:opacity-50">
              {busy ? `Converting… ${progress}%` : "Convert"}
            </button>
            {busy && <div className="w-full bg-surface-container-lowest rounded-full h-2"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>}
          </div>

          <div>
            {output ? (
              <div className="bg-surface-container rounded-xl p-5 space-y-4">
                <h3 className="font-headline font-bold">Result</h3>
                {format === "gif" ? (
                  <img src={output.url} alt="output" className="w-full rounded-lg" />
                ) : (
                  <video src={output.url} controls className="w-full rounded-lg" />
                )}
                <p className="text-sm text-on-surface-variant">{(output.size / 1024).toFixed(1)} KB</p>
                <a href={output.url} download={output.name} className="block text-center bg-secondary text-on-secondary font-bold py-3 rounded-lg">Download {output.name}</a>
                <ResultCountdownPanel
                  active={!!output}
                  resetKey={countdownKey}
                  onExpire={handleExpire}
                  onReconvert={convert}
                />
              </div>
            ) : (
              <div className="bg-surface-container rounded-xl p-12 text-center text-on-surface-variant">
                Result will appear here. First conversion downloads ~25MB FFmpeg core.
              </div>
            )}
          </div>
        </div>

        <ToolSeoSection path="/video-to-gif" />
        <RelatedTools currentPath="/video-to-gif" />
      </div>
    </>
  );
};

export default VideoToGif;
