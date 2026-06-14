# Social Content Calendar — WeboGrowth Tools

**Goal:** 1 tweet/day → 3-5 LinkedIn posts/week → 2 Reddit value posts/week.
**Voice:** Helpful dev/marketer, no hype, always link the relevant free tool.

---

## Weekly Cadence (Twitter/X)

| Day | Theme | Source | Auto? |
|-----|-------|--------|-------|
| Mon | 📖 New blog article | `--mode=blog` | ✅ GitHub Action |
| Tue | 🛠 Tool of the day | `--mode=tool` | ✅ GitHub Action |
| Wed | 💡 Tip / mini-thread | `--mode=queue` | ✅ GitHub Action |
| Thu | 🛠 Tool of the day | `--mode=tool` | ✅ GitHub Action |
| Fri | 💡 Tip / case study | `--mode=queue` | ✅ GitHub Action |
| Sat | 🔁 Engagement / RT others | Manual | ❌ |
| Sun | 📊 Weekly recap / poll | Manual | ❌ |

**Best post times (UTC):** 13:00, 16:00, 20:00. The action runs at **14:00 UTC** daily.

---

## Monthly Theme Rotation

- **Week 1** — Image performance (compressor, converter, resizer)
- **Week 2** — Developer productivity (json, css, base64, html→md)
- **Week 3** — SEO & social (meta tags, OG preview, robots, sitemap)
- **Week 4** — Design & branding (colors, gradients, favicon, QR)

---

## LinkedIn Cadence (Tue / Thu / Sat)

Format: 1 hook line → 3-5 short paragraphs → CTA link → 3 hashtags.

Recycle each blog article as a LinkedIn post 1 week after publication.

---

## Reddit Strategy

| Subreddit | Cadence | Allowed |
|-----------|---------|---------|
| r/webdev | 1x / 2 weeks | Showcase Saturday only |
| r/SideProject | 1x / month | Any day |
| r/InternetIsBeautiful | 1x / month | Unique tools only |
| r/SEO | 2x / month | Value comment first, link second |
| r/coolguides | 1x / month | Visual cheat sheet from blog |

**Rule:** Comment-to-post ratio must stay 10:1 or your account gets shadowbanned.

---

## How to Add a Tweet to the Queue

Edit `marketing/social-queue.json`:

```json
{ "text": "Your tweet body, max 280 chars\n\n👉 https://tools.webogrowth.com/...", "posted": null }
```

The next `--mode=queue` run will post it and set `posted` to a timestamp.

---

## Manual Run

```bash
# Dry-run (no secrets needed, prints to console):
node scripts/twitter-post.mjs --mode=blog --dry
node scripts/twitter-post.mjs --mode=tool --dry
node scripts/twitter-post.mjs --mode=queue --dry

# Live (requires the 4 TWITTER_* secrets):
node scripts/twitter-post.mjs --mode=tool
```

---

## Required GitHub Secrets

Set in **Repo → Settings → Secrets and variables → Actions**:

- `TWITTER_CONSUMER_KEY`
- `TWITTER_CONSUMER_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`

⚠ The X app must have **Read AND Write** permission (default is Read only) — change it before generating tokens, otherwise you'll get 403s.

---

## KPIs (review monthly)

| Metric | Target M1 | M3 | M6 |
|--------|-----------|----|----|
| Twitter followers | 100 | 500 | 2,000 |
| Avg impressions/tweet | 300 | 1,500 | 5,000 |
| Click-through to tools.webogrowth.com | 50/mo | 300/mo | 1,200/mo |
| LinkedIn followers | 50 | 250 | 1,000 |
