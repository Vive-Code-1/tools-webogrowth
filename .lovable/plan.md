

## Plan: Fix 4 Issues — Hero Animation, Admin Profile/Logo, Contact Form

### Issues Identified

1. **Homepage hero right side is empty** — The hero section uses `max-w-3xl` putting all content left, leaving right half blank
2. **Admin profile picture/name not reflecting** — The avatar upload and profile save work in localStorage but the `currentAdmin` state in header doesn't re-render properly because the header reads from state that may not update correctly
3. **Logo upload saves but doesn't show** — The logo saves to localStorage and `dispatchSettingsUpdate()` fires, but the Navbar listener and Admin header both depend on state that should work. Need to verify the actual rendering path is correct
4. **Contact form error "Failed to fetch"** — The Supabase Edge Function `send-contact-email` is NOT deployed. It exists as code but hasn't been deployed to Supabase. Need to use the Resend connector gateway pattern or deploy the edge function

### 1. Homepage Hero — Add Lottie Animation on Right Side

Install `lottie-react` package. Add a coding/developer-themed Lottie animation on the right side of the hero.

Changes to `Index.tsx`:
- Change hero layout from single-column (`max-w-3xl`) to a 2-column grid (`grid-cols-1 lg:grid-cols-2`)
- Left column: existing text content
- Right column: Lottie animation (use a free coding/tech animation from LottieFiles CDN URL)
- Animation: floating code editor or developer tools visual

### 2. Fix Admin Profile/Avatar Save

The `handleAvatarUpload` and `handleProfileSave` functions update localStorage and state correctly. The issue is that after avatar upload, the header component re-renders with the updated `currentAdmin` state. Looking at the code, this should work — but the `dispatchSettingsUpdate` event is not fired after avatar changes, so the admin header logo/avatar might not refresh.

Fix: After avatar upload and profile save, also call `dispatchSettingsUpdate()` to ensure any listeners refresh. Also ensure the header section re-reads `currentAdmin` after state updates.

### 3. Fix Logo Not Showing

The logo upload code saves to localStorage and dispatches `wg-settings-updated`. The Navbar listens for this event. This should work. Let me verify: the `handleLogoUpload` saves to `SETTINGS_KEY` in localStorage AND calls `dispatchSettingsUpdate()` — this is correct.

Potential issue: The logo might be too large for localStorage (base64 of large images). Or the `settings.logo` state update might not trigger re-render in the admin page because `setSettings` is called with the new object but the admin header reads from `settings.logo` which should update.

Fix: Ensure the Admin header and Navbar both re-read from localStorage on the custom event. Add a force re-read in Admin component when settings change.

### 4. Fix Contact Form — Deploy Edge Function

The edge function exists at `supabase/functions/send-contact-email/index.ts` but is not deployed. The "Failed to fetch" error confirms this.

The edge function uses `RESEND_API_KEY` from `Deno.env` and the secret is configured. The function code looks correct (inline CORS headers, Resend API call).

**Solution**: The edge function needs to be deployed. This happens automatically when the project is published. However, for the preview to work, we need to ensure the function is deployable.

Also update the edge function to use the Resend connector gateway pattern for better reliability:
- Use `https://connector-gateway.lovable.dev/resend/emails` instead of `https://api.resend.com/emails`
- Add `Authorization: Bearer ${LOVABLE_API_KEY}` and `X-Connection-Api-Key: ${RESEND_API_KEY}` headers

### Files to Update
- `src/pages/Index.tsx` — Add 2-column hero with Lottie animation
- `src/pages/Admin.tsx` — Fix avatar/profile state refresh
- `src/pages/ContactUs.tsx` — Improve error handling
- `supabase/functions/send-contact-email/index.ts` — Use Resend connector gateway

### Dependencies to Add
- `lottie-react` — For Lottie animations

### Implementation Order
1. Install lottie-react
2. Update hero section with Lottie animation
3. Fix admin profile/avatar/logo state management
4. Update edge function to use connector gateway
5. Deploy edge function

