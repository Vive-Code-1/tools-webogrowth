/**
 * Privacy-friendly page analytics.
 * No cookies, no IP storage, no cross-site identifiers.
 * One row is written when the visitor leaves a page, carrying:
 *   path, traffic source, device type, dwell time and bounce flag.
 */

const SESSION_KEY = "wg_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

const SEARCH_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo.", "yandex.", "ecosia.", "brave."];
const SOCIAL_HOSTS = [
  "facebook.",
  "t.co",
  "twitter.",
  "x.com",
  "linkedin.",
  "reddit.",
  "pinterest.",
  "instagram.",
  "youtube.",
  "news.ycombinator.com",
  "producthunt.com",
  "dev.to",
  "medium.com",
];

export function classifySource(referrer: string, search: string): { source: string; host: string | null } {
  const params = new URLSearchParams(search);
  const utm = params.get("utm_source");
  if (utm) return { source: `utm:${utm.toLowerCase().slice(0, 40)}`, host: utm.toLowerCase().slice(0, 60) };

  if (!referrer) return { source: "direct", host: null };
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: "direct", host: null };
  }
  if (typeof window !== "undefined" && host === window.location.hostname) {
    return { source: "internal", host };
  }
  if (SEARCH_HOSTS.some((h) => host.includes(h))) return { source: "organic_search", host };
  if (SOCIAL_HOSTS.some((h) => host.includes(h))) return { source: "social", host };
  return { source: "referral", host };
}

function deviceType(): string {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

interface Pending {
  path: string;
  start: number;
  sent: boolean;
  source: string;
  host: string | null;
}

let pending: Pending | null = null;

const BOUNCE_MS = 15_000;

function endpoint(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return `${url}/rest/v1/page_views`;
}

function flush() {
  if (!pending || pending.sent) return;
  const url = endpoint();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;

  const dwell = Math.min(Math.round(performance.now() - pending.start), 7_200_000);
  const body = JSON.stringify({
    path: pending.path.slice(0, 512),
    referrer_source: pending.source.slice(0, 64),
    referrer_host: pending.host ? pending.host.slice(0, 255) : null,
    device: deviceType(),
    dwell_ms: dwell,
    is_bounce: dwell < BOUNCE_MS,
    session_id: getSessionId(),
  });

  pending.sent = true;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  // keepalive fetch survives page unload in every modern browser and,
  // unlike sendBeacon, lets us attach the required auth headers.
  fetch(url, { method: "POST", headers, body, keepalive: true }).catch(() => {
    /* analytics must never break the page */
  });
}

/** Starts tracking a new page. Flushes the previous one first. */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/admin")) return;
  flush();
  const { source, host } = classifySource(document.referrer || "", window.location.search);
  pending = { path, start: performance.now(), sent: false, source, host };
}

let listenersBound = false;

export function bindAnalyticsListeners() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
