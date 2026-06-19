import { useMemo, useState } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

type Header = { k: string; v: string };

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

const escapeShell = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

const CurlBuilder = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState<typeof METHODS[number]>("GET");
  const [url, setUrl] = useState("https://api.example.com/users");
  const [headers, setHeaders] = useState<Header[]>([{ k: "Content-Type", v: "application/json" }]);
  const [body, setBody] = useState(`{"name":"WeboGrowth"}`);
  const [includeBody, setIncludeBody] = useState(false);
  const [auth, setAuth] = useState<{ type: "none" | "bearer" | "basic"; token?: string; user?: string; pass?: string }>({ type: "none" });
  const [response, setResponse] = useState<{ status: number; headers: string; body: string; ms: number } | null>(null);
  const [sending, setSending] = useState(false);

  const finalHeaders = useMemo(() => {
    const h = headers.filter((x) => x.k.trim());
    if (auth.type === "bearer" && auth.token) h.push({ k: "Authorization", v: `Bearer ${auth.token}` });
    if (auth.type === "basic" && (auth.user || auth.pass)) h.push({ k: "Authorization", v: `Basic ${btoa(`${auth.user || ""}:${auth.pass || ""}`)}` });
    return h;
  }, [headers, auth]);

  const curl = useMemo(() => {
    let cmd = `curl -X ${method} ${escapeShell(url)}`;
    finalHeaders.forEach((h) => { cmd += ` \\\n  -H ${escapeShell(`${h.k}: ${h.v}`)}`; });
    if (includeBody && body && method !== "GET" && method !== "HEAD") {
      cmd += ` \\\n  -d ${escapeShell(body)}`;
    }
    return cmd;
  }, [method, url, finalHeaders, body, includeBody]);

  const fetchCode = useMemo(() => {
    const hObj: Record<string, string> = {};
    finalHeaders.forEach((h) => { hObj[h.k] = h.v; });
    const opts: any = { method, headers: hObj };
    if (includeBody && body && method !== "GET" && method !== "HEAD") opts.body = body;
    return `await fetch(${JSON.stringify(url)}, ${JSON.stringify(opts, null, 2)});`;
  }, [method, url, finalHeaders, body, includeBody]);

  const send = async () => {
    setSending(true); setResponse(null);
    const t0 = performance.now();
    try {
      const init: RequestInit = { method, headers: Object.fromEntries(finalHeaders.map((h) => [h.k, h.v])) };
      if (includeBody && body && method !== "GET" && method !== "HEAD") init.body = body;
      const r = await fetch(url, init);
      const text = await r.text();
      const hs = Array.from(r.headers.entries()).map(([k, v]) => `${k}: ${v}`).join("\n");
      setResponse({ status: r.status, headers: hs, body: text, ms: Math.round(performance.now() - t0) });
    } catch (e: any) {
      setResponse({ status: 0, headers: "", body: `Network error: ${e.message}\n\n(CORS may block direct browser requests to external APIs.)`, ms: Math.round(performance.now() - t0) });
    } finally { setSending(false); }
  };

  return (
    <>
      <SEOHead {...getSeoProps("/curl-builder")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            cURL / HTTP <br /><span className="text-secondary">Request Builder</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Build HTTP requests visually, copy as cURL or fetch(), and test directly in the browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <select value={method} onChange={(e) => setMethod(e.target.value as any)}
                className="bg-surface-container rounded-lg px-3 py-3 font-bold text-sm outline-none">
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <input value={url} onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-surface-container rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-primary font-mono text-sm" />
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold">Headers</h3>
                <button onClick={() => setHeaders((h) => [...h, { k: "", v: "" }])} className="text-xs text-primary">+ Add</button>
              </div>
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input value={h.k} onChange={(e) => setHeaders((arr) => arr.map((x, ix) => ix === i ? { ...x, k: e.target.value } : x))}
                    placeholder="Header" className="flex-1 bg-surface-container-lowest rounded px-2 py-1.5 text-sm font-mono outline-none" />
                  <input value={h.v} onChange={(e) => setHeaders((arr) => arr.map((x, ix) => ix === i ? { ...x, v: e.target.value } : x))}
                    placeholder="Value" className="flex-1 bg-surface-container-lowest rounded px-2 py-1.5 text-sm font-mono outline-none" />
                  <button onClick={() => setHeaders((arr) => arr.filter((_, ix) => ix !== i))} className="text-destructive px-2">×</button>
                </div>
              ))}
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-3">
              <h3 className="font-headline font-bold">Auth</h3>
              <select value={auth.type} onChange={(e) => setAuth({ type: e.target.value as any })}
                className="bg-surface-container-lowest rounded-lg px-3 py-2 text-sm outline-none">
                <option value="none">None</option><option value="bearer">Bearer Token</option><option value="basic">Basic Auth</option>
              </select>
              {auth.type === "bearer" && (
                <input value={auth.token || ""} onChange={(e) => setAuth({ ...auth, token: e.target.value })} placeholder="Token"
                  className="w-full bg-surface-container-lowest rounded px-2 py-1.5 text-sm font-mono outline-none" />
              )}
              {auth.type === "basic" && (
                <div className="grid grid-cols-2 gap-2">
                  <input value={auth.user || ""} onChange={(e) => setAuth({ ...auth, user: e.target.value })} placeholder="Username"
                    className="bg-surface-container-lowest rounded px-2 py-1.5 text-sm outline-none" />
                  <input value={auth.pass || ""} onChange={(e) => setAuth({ ...auth, pass: e.target.value })} placeholder="Password" type="password"
                    className="bg-surface-container-lowest rounded px-2 py-1.5 text-sm outline-none" />
                </div>
              )}
            </div>

            <div className="bg-surface-container rounded-xl p-5 space-y-2">
              <label className="flex items-center gap-2 font-headline font-bold">
                <input type="checkbox" checked={includeBody} onChange={(e) => setIncludeBody(e.target.checked)} /> Body
              </label>
              {includeBody && (
                <textarea value={body} onChange={(e) => setBody(e.target.value)}
                  className="w-full h-40 bg-surface-container-lowest rounded-lg p-3 font-mono text-sm outline-none resize-none" />
              )}
            </div>

            <button onClick={send} disabled={sending} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:opacity-50">
              {sending ? "Sending…" : "Send Request"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline font-bold">cURL</h3>
                <button onClick={() => { navigator.clipboard.writeText(curl); toast({ title: "Copied" }); }} className="text-xs text-primary">Copy</button>
              </div>
              <pre className="font-mono text-xs bg-surface-container-lowest rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">{curl}</pre>
            </div>
            <div className="bg-surface-container rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-headline font-bold">fetch()</h3>
                <button onClick={() => { navigator.clipboard.writeText(fetchCode); toast({ title: "Copied" }); }} className="text-xs text-primary">Copy</button>
              </div>
              <pre className="font-mono text-xs bg-surface-container-lowest rounded-lg p-4 overflow-x-auto">{fetchCode}</pre>
            </div>
            {response && (
              <div className="bg-surface-container rounded-xl p-5 space-y-2">
                <div className="flex gap-3 items-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${response.status >= 200 && response.status < 300 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                    {response.status || "ERR"}
                  </span>
                  <span className="text-xs text-on-surface-variant">{response.ms}ms</span>
                </div>
                <details><summary className="text-xs text-on-surface-variant cursor-pointer">Headers</summary>
                  <pre className="font-mono text-xs bg-surface-container-lowest rounded p-2 mt-1 max-h-40 overflow-y-auto">{response.headers}</pre>
                </details>
                <pre className="font-mono text-xs bg-surface-container-lowest rounded p-3 max-h-80 overflow-y-auto whitespace-pre-wrap break-all">{response.body}</pre>
              </div>
            )}
          </div>
        </div>

        <ToolSeoSection path="/curl-builder" />
        <RelatedTools currentPath="/curl-builder" />
      </div>
    </>
  );
};

export default CurlBuilder;
