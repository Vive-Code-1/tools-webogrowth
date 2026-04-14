

## Plan: JSON-LD per Tool + OG Image + Pages + Mega Menu Fix + Admin Panel

### 1. JSON-LD Structured Data per Tool Page

Update `SEOHead.tsx` to accept optional `jsonLd` prop. Each tool page will include `SoftwareApplication` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON Formatter & Validator",
  "url": "https://tools.webogrowth.com/json-formatter",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0" },
  "author": { "@type": "Organization", "name": "WeboGrowth" }
}
```

All 17 tool pages will get their own JSON-LD automatically via SEOHead.

### 2. OG Image Setup

Copy the uploaded `Fabook_cover-01.jpg` to `public/og-image.jpg`. Update:
- `index.html` — add `og:image` meta tag pointing to `https://tools.webogrowth.com/og-image.jpg`
- `SEOHead.tsx` — add `og:image` and `twitter:image` meta tags using the same image

### 3. New Pages (4 pages)

**Privacy Policy** (`/privacy-policy`) — Standard privacy policy for a browser-based tools site (no data collection, browser-only processing, cookies info)

**Terms of Service** (`/terms-of-service`) — Standard ToS for free online tools

**About Us** (`/about-us`) — Content from webogrowth.com homepage:
- WeboGrowth is a full-service digital agency
- Services: Web Development, SEO, Graphic Design, Social Media Marketing, UI/UX, SaaS Development
- Head Office: Uposhohor Rd No 1, Apt 423, Bogura, Bangladesh
- Contact: +880 1791208768, Support@webogrowth.com

**Contact Us** (`/contact-us`) — Contact form + info from webogrowth.com:
- Address, phone numbers, email
- WhatsApp link
- Contact form (name, email, service, message)

### 4. Fix Mega Menu (Navbar)

Current issues: dropdown disappears before clicking links, text too small. Changes:
- Increase `min-w` from `520px` to `640px`
- Increase link text from `text-sm` to `text-base` with `py-1.5` padding
- Add proper `pt-2` gap bridge between trigger and dropdown (invisible hover bridge)
- Increase category label from `text-[10px]` to `text-xs`

### 5. Footer "Lorem Ipsum" → "Lorem Ipsum Generator"

Update footer link label from "Lorem Ipsum" to "Lorem Ipsum Generator". Also add Privacy Policy, Terms, About Us, Contact Us links.

### 6. Admin Dashboard

Create a simple admin panel at `/admin` with login (hardcoded email: `aabeg01@gmail.com`, password: `aabeg01@gmail.com`). Store auth state in React context (not localStorage for security — use sessionStorage).

**Admin Features:**
- **SEO Settings**: Edit site-wide meta title, description, keywords (stored in localStorage, injected via Helmet)
- **Verification Codes**: Input fields for Google Search Console meta tag, Google Analytics tracking ID, Bing Webmaster, Facebook domain verification — these get injected into `<head>` via Helmet
- **Logo Upload**: Upload/change site logo (stored as base64 in localStorage)
- **Sitemap Viewer**: View current sitemap.xml content
- **Tools Management**: View list of all tools with their SEO metadata

Admin route will be outside the main Layout (no navbar/footer) with its own dark dashboard UI.

### Files to Create
- `src/pages/PrivacyPolicy.tsx`
- `src/pages/TermsOfService.tsx`
- `src/pages/AboutUs.tsx`
- `src/pages/ContactUs.tsx`
- `src/pages/Admin.tsx`
- `src/contexts/AdminContext.tsx`

### Files to Update
- `src/components/SEOHead.tsx` — Add jsonLd prop + og:image
- `src/App.tsx` — Add 5 new routes
- `src/components/Navbar.tsx` — Fix mega menu hover + sizing
- `src/components/Footer.tsx` — Add page links, fix Lorem Ipsum label
- `index.html` — Add og:image meta tag
- `public/sitemap.xml` — Add new page URLs
- Copy OG image to `public/og-image.jpg`
- All 17 tool pages — Add JSON-LD data to SEOHead calls

### Implementation Order
1. Copy OG image + update SEOHead with jsonLd + og:image
2. Update all tool pages with JSON-LD
3. Create Privacy, Terms, About, Contact pages
4. Fix Navbar mega menu
5. Update Footer
6. Build Admin dashboard
7. Update routes, sitemap

