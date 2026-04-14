import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

const SETTINGS_KEY = "wg_admin_settings";

interface AdminSettings {
  googleSearchConsole?: string;
  googleAnalytics?: string;
  googleAdsId?: string;
  bingWebmaster?: string;
  facebookVerification?: string;
}

const AdminHeadInjector = () => {
  const [settings, setSettings] = useState<AdminSettings>({});

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { setSettings(JSON.parse(saved)); } catch {}
      }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("wg-settings-updated", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("wg-settings-updated", load);
    };
  }, []);

  const hasAny = settings.googleSearchConsole || settings.googleAnalytics || settings.bingWebmaster || settings.facebookVerification || settings.googleAdsId;
  if (!hasAny) return null;

  return (
    <Helmet>
      {settings.googleSearchConsole && <meta name="google-site-verification" content={settings.googleSearchConsole} />}
      {settings.bingWebmaster && <meta name="msvalidate.01" content={settings.bingWebmaster} />}
      {settings.facebookVerification && <meta name="facebook-domain-verification" content={settings.facebookVerification} />}
      {settings.googleAnalytics && <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalytics}`} />}
      {settings.googleAnalytics && (
        <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.googleAnalytics}')`}</script>
      )}
      {settings.googleAdsId && <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.googleAdsId}`} crossOrigin="anonymous" />}
    </Helmet>
  );
};

export default AdminHeadInjector;
