import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─── Server Component Client (read-only SSR) ────────────────────────────────
// Uses anon key with cookie-based session (no Supabase Auth, just for reads)
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in Server Components (read-only context)
        }
      },
    },
  });
}

import { createClient } from "@supabase/supabase-js";

// ─── Admin Client (Route Handlers / Server Actions / Server Components) ──
// Uses service_role key — bypasses RLS, NEVER expose to browser
// Use ONLY in server-side code (API routes, server actions, server components)
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (url, init) => {
        // Force Next.js to never cache these Supabase API calls
        return fetch(url, { ...init, cache: "no-store" });
      },
    },
  });
}
