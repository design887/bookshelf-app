"use client";
import { createClient } from "@supabase/supabase-js";

// Singleton — created once, reused across the app
let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // graceful fallback: no Supabase configured
  _supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _supabase;
}
