import { useState, useMemo } from "react";
import SEOHead from "@/components/SEOHead";
import { getSeoProps } from "@/lib/seo";
import ToolSeoSection from "@/components/ToolSeoSection";
import RelatedTools from "@/components/RelatedTools";
import { useToast } from "@/hooks/use-toast";

function base64UrlDecode(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return atob(s);
  }
}

async function hmacVerify(header: string, payload: string, signature: string, secret: string, alg: string) {
  const algMap: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
  const hashAlg = algMap[alg];
  if (!hashAlg) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: hashAlg },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${payload}`));
  const bytes = new Uint8Array(sig);
  let b64 = btoa(String.fromCharCode(...bytes));
  b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64 === signature;
}

const JwtDecoder = () => {
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<"valid" | "invalid" | null>(null);

  const parsed = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return { error: "JWT must have 3 parts separated by dots." };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return { header, payload, signature: parts[2], raw: parts };
    } catch (e) {
      return { error: `Decode failed: ${(e as Error).message}` };
    }
  }, [token]);

  const expiry = useMemo(() => {
    if (!parsed || "error" in parsed) return null;
    const exp = parsed.payload?.exp;
    if (typeof exp !== "number") return null;
    const ms = exp * 1000 - Date.now();
    return { ms, date: new Date(exp * 1000), expired: ms <= 0 };
  }, [parsed]);

  const handleVerify = async () => {
    if (!parsed || "error" in parsed) return;
    const alg = parsed.header?.alg;
    if (!["HS256", "HS384", "HS512"].includes(alg)) {
      toast({ title: "Only HMAC algorithms supported", description: `${alg} requires public-key verification.`, variant: "destructive" });
      return;
    }
    const ok = await hmacVerify(parsed.raw[0], parsed.raw[1], parsed.signature, secret, alg);
    setVerifyResult(ok ? "valid" : "invalid");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IldlYm9Hcm93dGgiLCJpYXQiOjE3MDAwMDAwMDB9.kCx7T_Z3jpHHFXX5xLO2bSAxIqzMR8R3xkO2WQ7uG7w";

  return (
    <>
      <SEOHead {...getSeoProps("/jwt-decoder")!} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="text-primary tracking-[0.2em] font-extrabold uppercase mb-4 block text-xs font-label">Developer Tool</span>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-6 leading-[0.9]">
            JWT Decoder <br /><span className="text-secondary">& Verifier</span>
          </h1>
          <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
            Paste a JWT to decode header, payload and signature. Inspect claims, check expiry, and verify HMAC signatures — all in your browser.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant">JWT Token</label>
              <button onClick={() => setToken(sample)} className="text-xs text-primary hover:underline">Load sample</button>
            </div>
            <textarea
              value={token}
              onChange={(e) => { setToken(e.target.value); setVerifyResult(null); }}
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              className="w-full h-48 bg-surface-container rounded-xl p-6 font-mono text-sm break-all outline-none focus:ring-1 focus:ring-primary resize-none"
            />

            <label className="text-sm font-label uppercase tracking-widest text-on-surface-variant block">HMAC Secret (optional)</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setVerifyResult(null); }}
              placeholder="your-256-bit-secret"
              className="w-full bg-surface-container rounded-lg px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleVerify}
              disabled={!secret || !parsed || "error" in (parsed || {})}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg disabled:opacity-50 hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              Verify Signature
            </button>
            {verifyResult && (
              <div className={`rounded-lg p-3 text-sm font-bold flex items-center gap-2 ${verifyResult === "valid" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                <span className="material-symbols-outlined">{verifyResult === "valid" ? "verified" : "error"}</span>
                Signature {verifyResult === "valid" ? "is valid" : "does NOT match"}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!parsed && (
              <div className="bg-surface-container rounded-xl p-12 text-center text-on-surface-variant">
                Decoded JWT will appear here.
              </div>
            )}
            {parsed && "error" in parsed && (
              <div className="bg-destructive/10 text-destructive rounded-xl p-6 text-sm">{parsed.error}</div>
            )}
            {parsed && !("error" in parsed) && (
              <>
                <div className="bg-surface-container rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-label uppercase tracking-widest text-primary font-bold">Header</h4>
                    <button onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), "Header")} className="text-on-surface-variant hover:text-primary text-xs">Copy</button>
                  </div>
                  <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(parsed.header, null, 2)}</pre>
                </div>

                <div className="bg-surface-container rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-label uppercase tracking-widest text-secondary font-bold">Payload</h4>
                    <button onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), "Payload")} className="text-on-surface-variant hover:text-primary text-xs">Copy</button>
                  </div>
                  <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(parsed.payload, null, 2)}</pre>
                </div>

                {expiry && (
                  <div className={`rounded-xl p-4 text-sm ${expiry.expired ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined">{expiry.expired ? "timer_off" : "timer"}</span>
                      {expiry.expired ? "Expired" : "Active"}
                    </div>
                    <p className="text-xs mt-1 opacity-80">Expires: {expiry.date.toLocaleString()}</p>
                  </div>
                )}

                <div className="bg-surface-container rounded-xl p-5">
                  <h4 className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold mb-2">Signature</h4>
                  <p className="font-mono text-xs break-all opacity-70">{parsed.signature}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <ToolSeoSection path="/jwt-decoder" />
        <RelatedTools currentPath="/jwt-decoder" />
      </div>
    </>
  );
};

export default JwtDecoder;
