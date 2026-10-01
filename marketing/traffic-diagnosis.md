# Traffic Diagnosis — WeboGrowth Tools (Oct 2026)

## What the data shows

**Indexing is NOT the main problem.** Live Google URL Inspection of all 124 sitemap URLs:

| Status | URLs |
|---|---|
| Submitted and indexed | 104 |
| Crawled – currently not indexed | 11 |
| Discovered – currently not indexed | 4 |
| URL is unknown to Google | 4 |
| Soft 404 | 1 (`/sitemap-generator`) |

**Visitors (first 30 days of own tracking):** ~45 page views, mostly direct, avg. 7 s on the homepage with 100% bounce. Tool pages (`/compressor` 2m11s, `/converter` 65s) hold attention; blog posts mostly bounce.

## Root causes (in order of impact)

1. **Near-zero domain authority.** Pages are indexed but rank on page 3+ because almost no other sites link here. Google trusts 80 posts from a brand-new domain very little.
2. **Too many thin, overlapping posts, too fast.** 80 AI-written posts in ~4 months; average 1,034 words; 39 posts under the 1,100-word target. "Crawled – not indexed" is Google's signal for "not useful enough yet".
3. **Posts don't funnel into tools.** 35 posts have fewer than 2 related tools, 34 have fewer than 3 FAQs, all 80 have no in-body image. Readers land and leave.
4. **Sitemap claimed every page changed daily.** All `lastmod` values were set to the build date, which teaches Google to ignore the signal. Fixed — `lastmod` removed.
5. **Homepage doesn't hold visitors.** 7 s average and full bounce: the first screen needs a search box / top-3 tools immediately.

## Fixed in this update

- Visitor + reading-time tracking for every page (Admin → Visitors)
- Live index status of every sitemap URL, not-indexed list + CSV (Admin → Index Status)
- Per-post SEO score and fixes (Admin → Post SEO Audit); average today 78/100, 50 posts below 85
- New posts are auto-fixed (≥4 internal links, related tools block) and audited before publishing
- Sitemap `lastmod` removed

## Next 30 days

1. Slow the auto-publisher to **3 posts/week** and spend the rest on improving the 50 low-scoring posts (Admin → Post SEO Audit, start with the lowest).
2. Rewrite the 11 "Crawled – not indexed" posts: add a real example, screenshot, comparison table and FAQs; then re-check in Index Status.
3. Merge near-duplicate posts (e.g. multiple HEIC, JSON, gradient posts) into one stronger guide and 301 the rest.
4. Add real content to `/sitemap-generator` (how-to, FAQ, examples) to clear the Soft 404.
5. Start the link plan in `authority-plan.md` — this is the biggest lever.
