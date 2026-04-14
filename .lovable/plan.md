

## Plan: Contact Form Fix + Logo Integration + Admin Upgrades + Google Ads Support

### Issues Identified

1. **Contact form goes blank** — The edge function fails (likely CORS or import issue with `@supabase/supabase-js/cors`), falls back to `window.open(mailto:...)` which navigates away from the page
2. **Visit Our Website section** — Uses generic `public` icon instead of WeboGrowth logo; layout needs logo on left, text on right
3. **Admin logo upload** — `window.dispatchEvent(new Event("storage"))` only triggers `storage` event listeners in OTHER tabs, not the same tab; Navbar never updates
4. **Admin profile/admins features** — Already exist but need verification
5. **Google Ads support** — Missing from admin panel

### 1. Fix Contact Form (send-contact-email Edge Function)

**Problem**: `import { corsHeaders } from '@supabase/supabase-js/cors'` is invalid — this module doesn't exist. The function crashes, error is caught, and `window.open(mailto:...)` navigates away causing blank page.

**Fix**: Replace the invalid import with inline CORS headers in `supabase/functions/send-contact-email/index.ts`:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

Also fix `ContactUs.tsx` — the mailto fallback should NOT use `window.open()` (navigates away). Instead show a toast with mailto link or use `window.location.href` in a new approach. Better: just show error toast without navigating away.

### 2. Visit Our Website Section — Logo + Layout Fix

Copy `Favicon-01.png` to `public/wg-icon.png`. Update the "Visit Our Website" card in `ContactUs.tsx`:
- Replace `<span className="material-symbols-outlined">public</span>` with `<img src="/wg-icon.png" ...>`
- Change layout from centered to flex row: logo left, text right

### 3. Fix Admin Logo Sync to Navbar

**Root cause**: `window.dispatchEvent(new Event("storage"))` does NOT trigger `storage` event listeners in the same tab — the `storage` event only fires in other tabs/windows.

**Fix in Navbar.tsx**: Instead of relying on `storage` event, use a custom event name like `wg-settings-updated`. In Admin.tsx, dispatch `new CustomEvent("wg-settings-updated")` after saving. In Navbar.tsx, listen for both `storage` and `wg-settings-updated`.

### 4. Google Ads Support in Admin

Add a new field `googleAdsId` to `AdminSettings` interface and admin verification tab. Inject the Google Ads script via `AdminHeadInjector.tsx` similar to Google Analytics:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"></script>
```

Also add `googleAdsId` field to AdminHeadInjector.

### 5. Admin Logo also shown in Admin Header

Update admin header to show the uploaded logo if available.

### Files to Update
- `supabase/functions/send-contact-email/index.ts` — Fix CORS import
- `src/pages/ContactUs.tsx` — Fix mailto fallback, update Visit Our Website section with logo
- `src/components/Navbar.tsx` — Listen for custom event for logo sync
- `src/pages/Admin.tsx` — Dispatch custom event, add Google Ads field, show logo in header
- `src/components/AdminHeadInjector.tsx` — Add Google Ads injection, listen for custom event

### Files to Copy
- `user-uploads://Favicon-01.png` → `public/wg-icon.png`

### Implementation Order
1. Copy favicon icon to public
2. Fix edge function CORS
3. Fix ContactUs (form + Visit Our Website section)
4. Fix logo sync (custom event in Navbar + Admin)
5. Add Google Ads to Admin + AdminHeadInjector

