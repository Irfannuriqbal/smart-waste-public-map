import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8"

const config = await fetch("/api/supabase-config", { cache: "no-store" })
if (!config.ok) throw new Error("Konfigurasi Supabase belum tersedia")
const { url, publishableKey } = await config.json()

export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const next = encodeURIComponent(window.location.pathname)
    window.location.replace(`/login.html?next=${next}`)
    return null
  }
  return session
}

export function adminLoginUrl() {
  return "/login.html"
}
