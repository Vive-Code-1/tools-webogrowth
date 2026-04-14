

## সমস্যা

আপনি ঠিকই বলেছেন — আপনি Supabase credentials দিয়েছেন, তাই এই কাজগুলো আমারই করার কথা। তবে কিছু সীমাবদ্ধতা আছে:

### যা আমি করতে পারি

1. **Edge Function কোড** — ইতিমধ্যে তৈরি করা হয়েছে (`supabase/functions/cleanup-expired-files/index.ts`)
2. **Storage bucket তৈরি ও RLS policy** — আমি Supabase JS client ব্যবহার করে একটি **setup script** তৈরি করে রান করতে পারি যেটা:
   - `processed-files` bucket তৈরি করবে (public)
   - Storage RLS policies সেট করবে (INSERT/SELECT/DELETE for anon)
3. **Cron job SQL** — একটি migration file তৈরি করতে পারি যেটা `pg_cron` schedule সেট করবে

### যা আমি সরাসরি করতে পারি না

- **Edge Function deploy** — এটার জন্য Supabase CLI এবং `SUPABASE_SERVICE_ROLE_KEY` লাগে। আমার কাছে শুধু anon key আছে, service role key নেই। Edge function deploy করতে হলে আপনাকে **service role key** দিতে হবে (Supabase Dashboard → Settings → API → service_role key)।

### Plan

1. **Setup script তৈরি ও রান করা** — Node.js script যেটা Supabase Admin API দিয়ে `processed-files` bucket তৈরি করবে
2. **SQL migration তৈরি** — `pg_cron` schedule এর জন্য
3. **Edge function** — আপনার service role key পেলে deploy করতে পারবো, অথবা আপনাকে শুধু একটি CLI command রান করতে হবে: `supabase functions deploy cleanup-expired-files`

### আপনার কাছ থেকে যা দরকার

**Service Role Key** দিন (Supabase Dashboard → Settings → API → `service_role` secret key)। এটা পেলে আমি bucket তৈরি, RLS policy, এবং সবকিছু সেটআপ করে দিতে পারবো। এই key টি secret হিসেবে store করা হবে, কোডে expose হবে না।

