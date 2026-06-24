import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SETTINGS_KEY = "wg_admin_settings";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultSiteUrl?: string;
  defaultSitemap?: string;
}

interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

const GoogleSearchConsoleModal = ({
  open,
  onClose,
  defaultSiteUrl = "https://tools.webogrowth.com/",
  defaultSitemap = "https://tools.webogrowth.com/sitemap.xml",
}: Props) => {
  const { toast } = useToast();
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [sitemap, setSitemap] = useState(defaultSitemap);
  const [loading, setLoading] = useState<string | null>(null);
  const [sites, setSites] = useState<GscSite[]>([]);
  const [metaToken, setMetaToken] = useState("");

  useEffect(() => {
    if (open) refreshSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const call = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("gsc-manage", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
    return data;
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    setLoading(label);
    try {
      await fn();
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const refreshSites = () =>
    run("list", async () => {
      const data = await call("list_sites");
      setSites(Array.isArray(data?.siteEntry) ? data.siteEntry : []);
    });

  const getToken = () =>
    run("token", async () => {
      const data = await call("get_verification_token", { identifier: siteUrl });
      const raw = data?.token || "";
      // Token comes as full meta content attribute value
      const content = raw.replace(/^.*content=["']?/, "").replace(/["']?\s*\/?>?\s*$/, "");
      const value = content.includes("=") ? content : raw;
      // Extract just the verification value after "google-site-verification=" or use raw
      const match = value.match(/google-site-verification=([^"'\s/>]+)/);
      const finalValue = match ? match[1] : value;
      setMetaToken(finalValue);
      // Save to admin settings so AdminHeadInjector renders the meta tag
      try {
        const current = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        const next = { ...current, googleSearchConsole: finalValue };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("wg-settings-updated"));
      } catch {
        /* ignore */
      }
      toast({
        title: "Verification token saved",
        description: "Meta tag added to your site. Publish/deploy before verifying.",
      });
    });

  const verifySite = () =>
    run("verify", async () => {
      await call("verify_site", { identifier: siteUrl });
      toast({ title: "Site verified ✓" });
      await refreshSites();
    });

  const addSite = () =>
    run("add", async () => {
      await call("add_site", { siteUrl });
      toast({ title: "Site added to Search Console" });
      await refreshSites();
    });

  const submitSitemap = () =>
    run("sitemap", async () => {
      await call("submit_sitemap", { siteUrl, feedpath: sitemap });
      toast({ title: "Sitemap submitted ✓", description: sitemap });
    });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/15 sticky top-0 bg-surface-container z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">search</span>
            <h3 className="font-headline font-bold text-lg">Google Search Console</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-foreground">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Site URL */}
          <div>
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant block mb-2">
              Site URL (with trailing slash)
            </label>
            <input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com/"
              className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>

          {/* Step 1: Verify */}
          <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
            <h4 className="font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">looks_one</span>
              Verify domain ownership
            </h4>
            <p className="text-xs text-on-surface-variant">
              Generates a META verification tag, saves it into site settings so it renders in the &lt;head&gt;, then asks Google to verify.
              <strong className="text-foreground"> Publish/deploy your site between Get Token and Verify.</strong>
            </p>
            {metaToken && (
              <div className="bg-surface-container-highest rounded-lg p-3 text-xs">
                <p className="text-on-surface-variant mb-1">Verification value (saved):</p>
                <code className="text-primary break-all">{metaToken}</code>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={getToken}
                disabled={loading !== null}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {loading === "token" ? "Getting…" : "1. Get & install token"}
              </button>
              <button
                onClick={verifySite}
                disabled={loading !== null}
                className="bg-surface-container-highest text-foreground px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {loading === "verify" ? "Verifying…" : "2. Verify site"}
              </button>
            </div>
          </div>

          {/* Step 2: Add */}
          <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
            <h4 className="font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">looks_two</span>
              Add site to Search Console
            </h4>
            <button
              onClick={addSite}
              disabled={loading !== null}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {loading === "add" ? "Adding…" : "Add site"}
            </button>
          </div>

          {/* Step 3: Sitemap */}
          <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
            <h4 className="font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">looks_3</span>
              Submit sitemap
            </h4>
            <input
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="w-full bg-surface-container-highest rounded-lg px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <button
              onClick={submitSitemap}
              disabled={loading !== null}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {loading === "sitemap" ? "Submitting…" : "Submit sitemap"}
            </button>
          </div>

          {/* Sites list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-headline font-bold text-sm">Connected sites</h4>
              <button
                onClick={refreshSites}
                disabled={loading !== null}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
            {sites.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No sites yet.</p>
            ) : (
              <ul className="space-y-1">
                {sites.map((s) => (
                  <li
                    key={s.siteUrl}
                    className="flex items-center justify-between text-xs bg-surface-container-highest rounded-lg px-3 py-2"
                  >
                    <code className="text-foreground break-all">{s.siteUrl}</code>
                    <span className="text-on-surface-variant ml-2">{s.permissionLevel}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSearchConsoleModal;
