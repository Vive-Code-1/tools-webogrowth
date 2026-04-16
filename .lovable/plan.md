

## Plan: Fix Contact Form + Sitemap + Admin Email Settings + Logo Text + Newsletter

### Summary of Issues & Fixes

1. **Contact form "Failed to fetch"** — Edge function is correctly coded but not deployed. Preview environment cannot call undeployed edge functions. The fix requires connecting the Resend connector (so gateway auth works) and redeploying the edge function.

2. **Sitemap missing pages** — Already has all 22 pages. No changes needed.

3. **Admin dashboard: Site Email & Newsletter Email fields** — Currently missing. Add `siteEmail` and `newsletterEmail` to AdminSettings interface and UI. The contact form edge function will read the recipient email from the request body (passed from admin settings stored in localStorage).

4. **Logo text "WeboGrowth Tools" showing alongside logo** — In `Navbar.tsx` line 287, the admin header shows `<h1>WeboGrowth Admin</h1>` text next to the logo. When logo is uploaded, only the logo image should show — remove the text fallback. Same fix needed in Navbar line 76.

5. **Newsletter subscribe** — Homepage "Join the WeboGrowth Lab" subscribe button does nothing. Wire it to invoke the same `send-contact-email` edge function (or a dedicated one) to email the subscription to the admin's configured newsletter email.

### Detailed Changes

#### 1. Connect Resend Connector + Redeploy Edge Function

Use `standard_connectors--connect` with `resend` to properly link the Resend connection. Then deploy the `send-contact-email` edge function. The function code is already correct (uses gateway pattern with `LOVABLE_API_KEY` + `RESEND_API_KEY`).

#### 2. Admin Settings — Add Email Fields

Update `AdminSettings` interface in `Admin.tsx`:
```typescript
interface AdminSettings {
  // ...existing fields...
  siteEmail: string;       // Where contact form submissions go
  newsletterEmail: string; // Where newsletter signups go
}
```

Add a new admin tab "Email Settings" with two input fields. Default values: `rafikuzzaman10@gmail.com` for both.

#### 3. Contact Form — Use Admin Email

Update `ContactUs.tsx` to read `siteEmail` from localStorage (`wg_admin_settings`) and pass it in the edge function request body. Update `send-contact-email/index.ts` to accept an optional `toEmail` parameter (fallback to hardcoded `rafikuzzaman10@gmail.com`).

#### 4. Newsletter Subscribe

Update `Index.tsx` newsletter section:
- Add state for email input and sending status
- On subscribe, invoke `send-contact-email` with a subject like "Newsletter Signup" and the subscriber's email
- Read `newsletterEmail` from localStorage to pass as recipient
- Show success/error toast

#### 5. Logo Text Fix

**Navbar.tsx (line 72-77)**: When `logo` is set, show only the image. When not set, show "WeboGrowth Tools" text. This already works correctly — the ternary is fine.

**Admin.tsx (line 287)**: Remove the always-visible `<h1>WeboGrowth Admin</h1>` text. When logo is uploaded, show only the logo. When no logo, show icon + "WeboGrowth Admin" text.

Change from:
```tsx
{settings.logo ? (
  <img src={settings.logo} alt="WeboGrowth" className="h-8" />
) : (
  <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
)}
<h1 className="text-lg font-headline font-bold">WeboGrowth Admin</h1>
```
To:
```tsx
{settings.logo ? (
  <img src={settings.logo} alt="WeboGrowth" className="h-8" />
) : (
  <>
    <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
    <h1 className="text-lg font-headline font-bold">WeboGrowth Admin</h1>
  </>
)}
```

### Files to Update
- `src/pages/Admin.tsx` — Add email settings tab, fix logo text
- `src/pages/ContactUs.tsx` — Read siteEmail from admin settings, pass to edge function
- `src/pages/Index.tsx` — Wire newsletter subscribe to send email
- `supabase/functions/send-contact-email/index.ts` — Accept optional `toEmail` parameter

### Implementation Order
1. Connect Resend connector
2. Update Admin with email settings + logo text fix
3. Update edge function to accept dynamic recipient
4. Update ContactUs to pass admin email
5. Wire newsletter subscribe
6. Deploy edge function

