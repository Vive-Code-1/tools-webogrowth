

## Plan: QR Code Advanced + Navbar/Footer Rework + Admin Upgrade + Animations + Contact Email + Cleanup

### 1. Advanced QR Code Generator (Reference: image-6.png)

Rebuild `QrCodeGenerator.tsx` with features matching the reference:
- **Content types**: URL, Text, Email, Phone, SMS, vCard, WiFi, Location tabs
- **Color customization**: Foreground color, background color, gradient options
- **Logo overlay**: Upload company logo to center of QR code (canvas compositing)
- **Body shape options**: Square, rounded, dots, classy rounded (visual selectors)
- **Eye frame shape options**: Square, circle, rounded variations
- **Transparent background**: Option to download with transparent BG
- **Download formats**: PNG, SVG
- **Quality slider**: Low to High quality with pixel size display
- **Size control**: Custom pixel dimensions

### 2. Navbar Restructure

Remove Compressor/Converter direct links. New nav items:
- **Home** (`/`)
- **About Us** (`/about-us`)
- **All Tools** (mega menu dropdown - existing)
- **Contact Us** (replaces "Get Started" button)

### 3. Footer Update

Remove "About Us" and "Contact Us" links from footer (they move to navbar). Keep tool categories + copyright + Privacy/Terms.

### 4. Admin Panel Enhancements

- **Fix logo upload**: Logo saves to localStorage but isn't reflected in Navbar — wire up Navbar to read admin logo from localStorage
- **Admin profile**: Name, avatar, password change (stored in localStorage)
- **Multi-admin**: Add/remove admin accounts (stored in localStorage array)
- **Additional admin features**:
  - Analytics dashboard (page view stats from localStorage)
  - Quick links to all tools
  - System info (build version, tools count)

### 5. Scroll to Top on Navigation

Add a `ScrollToTop` component using `useLocation` + `useEffect` to call `window.scrollTo(0, 0)` on every route change.

### 6. Framer Motion Animations

Install `framer-motion`. Add:
- **Page transitions**: Fade-in on route change
- **Scroll animations**: Cards animate in on scroll using `whileInView`
- **Hover effects**: Scale + glow on tool cards and buttons
- **Homepage hero**: Staggered text reveal
- **Tool cards**: Slide-up on scroll with stagger

### 7. Contact Form Email via Resend

The user provided a Resend API key. Since it's a publishable key used server-side, I'll create a Supabase Edge Function `send-contact-email` that:
- Receives form data from ContactUs page
- Sends email to `rafikuzzaman10@gmail.com` via Resend API
- Update ContactUs.tsx to invoke this edge function instead of mailto

### 8. Database Cleanup (5-minute auto-delete)

The existing `cleanup-expired-files` edge function already handles this. Ensure it's scheduled via Supabase cron or called periodically. The current implementation deletes files older than 5 minutes from `processed-files` bucket.

### 9. Code Minification

Vite already minifies in production builds. No changes needed — `vite build` uses esbuild/terser by default.

---

### Files to Create
- `src/components/ScrollToTop.tsx`
- `src/components/AnimatedSection.tsx` (reusable scroll animation wrapper)
- `supabase/functions/send-contact-email/index.ts`

### Files to Update
- `src/pages/QrCodeGenerator.tsx` — Complete rewrite with advanced features
- `src/components/Navbar.tsx` — Remove Compressor/Converter, add Home/About/Contact
- `src/components/Footer.tsx` — Remove About Us/Contact Us links
- `src/pages/Admin.tsx` — Add profile, multi-admin, logo fix
- `src/pages/ContactUs.tsx` — Use Resend edge function
- `src/App.tsx` — Add ScrollToTop, wrap with AnimatePresence
- `src/pages/Index.tsx` — Add framer-motion animations
- `src/components/Layout.tsx` — Add ScrollToTop component
- All tool page components — Add motion animations to cards

### Dependencies to Add
- `framer-motion` — Animations and page transitions

### Implementation Order
1. Install framer-motion
2. Create ScrollToTop + AnimatedSection components
3. Rebuild QR Code Generator with advanced features
4. Update Navbar and Footer
5. Upgrade Admin panel
6. Add animations to homepage and tool pages
7. Create contact email edge function
8. Update ContactUs to use edge function
9. Wire admin logo to Navbar

