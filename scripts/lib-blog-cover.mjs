// Topic-aware SVG cover builder for blog posts.
// Used by scripts/generate-blog-post.mjs (fallback path) and scripts/regen-blog-covers.mjs.

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clampText = (s, n, fallback = "") => {
  const v = String(s ?? "").trim();
  if (!v) return fallback;
  return v.length <= n ? v : v.slice(0, n - 1) + "…";
};

function wrapTitle(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1 ? last.slice(0, maxChars - 1) + "…" : last + "…";
  }
  return lines;
}

const COVER_PALETTES = {
  Image:     { glow: "#bef264", glow2: "#365314", accentA: "#bef264", accentB: "#65a30d", ring: "#84cc16", ring2: "#22c55e", badgeText: "#0a0f05" },
  Developer: { glow: "#67e8f9", glow2: "#0e7490", accentA: "#22d3ee", accentB: "#0891b2", ring: "#06b6d4", ring2: "#3b82f6", badgeText: "#03121a" },
  SEO:       { glow: "#fcd34d", glow2: "#92400e", accentA: "#fbbf24", accentB: "#d97706", ring: "#f59e0b", ring2: "#ea580c", badgeText: "#1a0f02" },
  Design:    { glow: "#f0abfc", glow2: "#86198f", accentA: "#e879f9", accentB: "#a21caf", ring: "#d946ef", ring2: "#ec4899", badgeText: "#1a021a" },
  Marketing: { glow: "#fda4af", glow2: "#9f1239", accentA: "#fb7185", accentB: "#e11d48", ring: "#f43f5e", ring2: "#dc2626", badgeText: "#1a0207" },
  PDF:       { glow: "#c4b5fd", glow2: "#5b21b6", accentA: "#a78bfa", accentB: "#7c3aed", ring: "#8b5cf6", ring2: "#6366f1", badgeText: "#0f0820" },
  Guide:     { glow: "#6ee7b7", glow2: "#065f46", accentA: "#34d399", accentB: "#059669", ring: "#10b981", ring2: "#14b8a6", badgeText: "#021a10" },
};

const TOPIC_ICONS = {
  image:    "M3 6a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm9 11a4 4 0 100-8 4 4 0 000 8z",
  code:     "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  search:   "M21 21l-5-5M10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z",
  palette:  "M12 22a10 10 0 110-20 10 10 0 0110 10c0 2.21-1.79 4-4 4h-2a2 2 0 00-2 2 3 3 0 01-2 4z",
  megaphone:"M3 11v2a2 2 0 002 2h2l5 4V5L7 9H5a2 2 0 00-2 2zM17 7a6 6 0 010 10",
  pdf:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M9 14h6M9 17h4",
  book:     "M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 16a4 4 0 014-4h12",
  qr:       "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  json:     "M8 4a4 4 0 00-4 4v3a3 3 0 01-3 3 3 3 0 013 3v3a4 4 0 004 4M16 4a4 4 0 014 4v3a3 3 0 003 3 3 3 0 00-3 3v3a4 4 0 01-4 4",
  css:      "M4 3l1.5 17L12 22l6.5-2L20 3H4zM8 8h8l-.5 4H9l.25 3L12 16l2.75-.75L15 13",
  html:     "M4 3l1.5 17L12 22l6.5-2L20 3H4zM7 7h10l-.5 5H8l.5 5 3.5 1 3.5-1 .25-3",
  color:    "M12 2L4 8v8l8 6 8-6V8l-8-6zM12 2v20M4 8l16 8M20 8L4 16",
  gradient: "M3 21h18M5 17h14M7 13h10M9 9h6M11 5h2",
  sitemap:  "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8",
  robot:    "M5 8h14v10H5zM9 4v4M15 4v4M9 13h0.01M15 13h0.01M9 17h6",
  speed:    "M12 2a10 10 0 1010 10M12 12l4-4M12 12L7 17",
  shield:   "M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z",
  text:     "M5 5h14M12 5v14M8 19h8",
  resize:   "M3 3h6M3 3v6M21 21h-6M21 21v-6M3 3l8 8M21 21l-8-8",
  crop:     "M6 2v16h16M2 6h16v16",
  watermark:"M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z",
  video:    "M3 6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM22 6l-5 4v4l5 4V6z",
  layers:   "M12 2L2 8l10 6 10-6-10-6zM2 14l10 6 10-6M2 11l10 6 10-6",
  link:     "M9 15l6-6M11 7l1-1a4 4 0 116 6l-1 1M13 17l-1 1a4 4 0 11-6-6l1-1",
};

export function pickIcon(category, keyword) {
  const kw = String(keyword || "").toLowerCase();
  const rules = [
    [/qr\s*code|wifi qr|vcard|menu qr/, "qr"],
    [/json/, "json"],
    [/gradient/, "gradient"],
    [/\bcss\b|stylesheet/, "css"],
    [/\bhtml\b|markup/, "html"],
    [/\bjwt\b|base64|regex|curl|diff|encoder|decoder|minifier|formatter|developer|api/, "code"],
    [/sitemap/, "sitemap"],
    [/robots/, "robot"],
    [/meta tag|schema|open graph|og image|seo|search console|indexing|backlink|keyword|alt text|alt-text/, "search"],
    [/page speed|core web vitals|lighthouse|performance/, "speed"],
    [/color palette/, "color"],
    [/favicon|apple touch icon/, "shield"],
    [/lorem|dummy text|placeholder text/, "text"],
    [/resize|resizer/, "resize"],
    [/\bcrop\b/, "crop"],
    [/watermark/, "watermark"],
    [/video|gif/, "video"],
    [/pdf/, "pdf"],
    [/svg|vector|trace/, "layers"],
    [/internal link|backlink|\blink\b/, "link"],
    [/heic|jpg|jpeg|png|webp|avif|image|photo|compressor|converter|background remover/, "image"],
    [/design|brand|logo/, "palette"],
    [/announce|launch|promote|marketing|share/, "megaphone"],
  ];
  for (const [re, key] of rules) if (re.test(kw)) return TOPIC_ICONS[key];
  const catMap = { Image: "image", Developer: "code", SEO: "search", Design: "palette", Marketing: "megaphone", PDF: "pdf", Guide: "book" };
  return TOPIC_ICONS[catMap[category] || "book"];
}

export function buildCoverSvg({ slug, title, subtitle, category = "Guide", keyword = "" }) {
  const h = hashString(slug);
  const palette = COVER_PALETTES[category] || COVER_PALETTES.Guide;
  const iconPath = pickIcon(category, keyword || subtitle || title);
  const variant = h % 4;
  const glowCx = 12 + (h % 18);
  const glowCy = 10 + ((h >> 3) % 22);
  const orbAng = (h >> 5) % 360;
  const orbAng2 = (h >> 9) % 360;

  const rawTitle = String(title || "").trim() || "WeboGrowth Guide";
  const titleSize = rawTitle.length > 56 ? 50 : rawTitle.length > 44 ? 56 : rawTitle.length > 32 ? 64 : 72;
  const lineHeight = Math.round(titleSize * 1.14);

  const cardX = 120, cardY = 135, cardW = 1040, cardH = 450;
  const padX = 175;
  const textRight = 760;
  const charLimit = Math.max(12, Math.floor((textRight - padX) / (titleSize * 0.55)));
  const finalLines = wrapTitle(rawTitle, charLimit, 3).map(escapeHtml);

  const safeSubtitle = escapeHtml(clampText(subtitle || keyword, 70));
  const badgeLabel = "WEBOGROWTH GUIDE";
  const badgePadX = 24;
  const badgeTextWidth = 178;
  const badgeWidth = badgeTextWidth + badgePadX * 2;
  const badgeHeight = 42;

  const badgeY = cardY + 40;
  const titleStartY = badgeY + badgeHeight + 70;
  const totalTitleHeight = finalLines.length * lineHeight;
  const subtitleY = titleStartY + totalTitleHeight - lineHeight + 50;
  const underlineY = subtitleY + 32;

  const titleTspans = finalLines
    .map((l, i) => `<tspan x="${padX}" ${i === 0 ? "" : `dy="${lineHeight}"`}>${l}</tspan>`)
    .join("");

  const iconCx = 990, iconCy = cardY + cardH / 2 - 10;
  const iconR = 110;
  const iconScale = 5.6;
  const iconTx = iconCx - 12 * iconScale;
  const iconTy = iconCy - 12 * iconScale;

  const decor = (() => {
    switch (variant) {
      case 0: return `<circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 50}" fill="none" stroke="${palette.accentA}" stroke-opacity="0.18" stroke-width="2" stroke-dasharray="4 8"/>`;
      case 1: return `<g opacity="0.22" stroke="${palette.accentA}" stroke-width="1.4" fill="none"><circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 30}"/><circle cx="${iconCx}" cy="${iconCy}" r="${iconR + 60}"/></g>`;
      case 2: return `<rect x="${iconCx - iconR - 40}" y="${iconCy - iconR - 40}" width="${iconR * 2 + 80}" height="${iconR * 2 + 80}" rx="40" fill="none" stroke="${palette.accentA}" stroke-opacity="0.22" stroke-width="2" transform="rotate(${(orbAng2 % 20) - 10} ${iconCx} ${iconCy})"/>`;
      default: return `<polygon points="${iconCx},${iconCy - iconR - 50} ${iconCx + iconR + 45},${iconCy} ${iconCx},${iconCy + iconR + 50} ${iconCx - iconR - 45},${iconCy}" fill="none" stroke="${palette.accentA}" stroke-opacity="0.22" stroke-width="2"/>`;
    }
  })();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${escapeHtml(rawTitle)}">
  <defs>
    <radialGradient id="glow" cx="${glowCx}%" cy="${glowCy}%" r="78%">
      <stop offset="0" stop-color="${palette.glow}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${palette.glow2}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#1f2937"/>
      <stop offset="1" stop-color="#0b1220"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${palette.accentA}"/>
      <stop offset="1" stop-color="${palette.accentB}"/>
    </linearGradient>
    <radialGradient id="iconBg" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${palette.accentA}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${palette.accentB}" stop-opacity="0.04"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="#020617"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <g transform="rotate(${orbAng} 1120 120)"><circle cx="1120" cy="120" r="220" fill="${palette.ring}" opacity="0.10"/></g>
  <g transform="rotate(${orbAng2} 1180 640)"><circle cx="1180" cy="640" r="280" fill="${palette.ring2}" opacity="0.07"/></g>
  <g opacity="0.16" stroke="${palette.accentA}" stroke-width="1">
    <path d="M120 180H1160M120 260H1160M120 340H1160M120 420H1160M120 500H1160M120 580H1160"/>
    <path d="M240 110V620M400 110V620M560 110V620M720 110V620M880 110V620M1040 110V620"/>
  </g>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="36" fill="url(#card)" stroke="${palette.accentA}" stroke-opacity="0.32" stroke-width="2"/>

  ${decor}
  <circle cx="${iconCx}" cy="${iconCy}" r="${iconR}" fill="url(#iconBg)" stroke="${palette.accentA}" stroke-opacity="0.55" stroke-width="2"/>
  <g transform="translate(${iconTx} ${iconTy}) scale(${iconScale})" fill="none" stroke="${palette.accentA}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="${iconPath}"/>
  </g>

  <rect x="${padX}" y="${badgeY}" width="${badgeWidth}" height="${badgeHeight}" rx="21" fill="url(#accent)"/>
  <text x="${padX + badgePadX}" y="${badgeY + 28}" textLength="${badgeTextWidth}" lengthAdjust="spacingAndGlyphs" fill="${palette.badgeText}" font-family="Inter, Arial, Helvetica, sans-serif" font-size="18" font-weight="800" letter-spacing="2">${badgeLabel}</text>

  <text fill="#f8fafc" font-family="Inter, Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="800" y="${titleStartY}" style="letter-spacing:-1px">${titleTspans}</text>
  <text x="${padX}" y="${subtitleY}" fill="#94a3b8" font-family="Inter, Arial, Helvetica, sans-serif" font-size="24" font-weight="500">${safeSubtitle}</text>
  <path d="M${padX} ${underlineY}H${padX + 280}" stroke="url(#accent)" stroke-width="6" stroke-linecap="round"/>
  <text x="1140" y="560" text-anchor="end" fill="#475569" font-family="Inter, Arial, Helvetica, sans-serif" font-size="16" font-weight="600" letter-spacing="3">TOOLS.WEBOGROWTH.COM</text>
</svg>
`;
}
