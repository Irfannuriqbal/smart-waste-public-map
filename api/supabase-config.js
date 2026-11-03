export default function handler(_request, response) {
  const url = process.env.SUPABASE_URL
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    return response.status(503).json({
      message: "Konfigurasi Supabase belum tersedia."
    })
  }

  response.setHeader("Cache-Control", "no-store")
  return response.status(200).json({ url, publishableKey })
}
