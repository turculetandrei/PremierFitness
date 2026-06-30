import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase pentru componente server (citește/scrie cookie-urile sesiunii)
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // Apelat dintr-o componentă server fără posibilitatea de a seta cookie-uri.
            // Poate fi ignorat dacă există un proxy care reîmprospătează sesiunea.
          }
        },
      },
    }
  );
}

// Returnează utilizatorul autentificat (sau null)
export async function getUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
