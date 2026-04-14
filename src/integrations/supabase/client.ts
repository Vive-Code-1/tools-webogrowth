import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vgfpjhimlztysvpxcgab.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9rTLk0jHKilBbufyn6SIXg_AAjSj77m";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
