export default async function handler(_request, response) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response.status(503).json({
      arm_rolls: [],
      updated_at: null,
      message: "Konfigurasi database monitoring belum tersedia."
    })
  }

  try {
    const upstream = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/rest/v1/arm_roll_public?select=arm_roll_code,name,latitude,longitude,status,updated_at&order=arm_roll_code.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      }
    )
    if (!upstream.ok) throw new Error(`Supabase ${upstream.status}`)

    const arm_rolls = await upstream.json()
    const updatedAt = arm_rolls.reduce(
      (latest, armRoll) => !latest || armRoll.updated_at > latest ? armRoll.updated_at : latest,
      null
    )
    response.setHeader("Cache-Control", "no-store")
    return response.status(200).json({ arm_rolls, updated_at: updatedAt })
  } catch {
    return response.status(502).json({
      arm_rolls: [],
      updated_at: null,
      message: "Data monitoring belum dapat dimuat."
    })
  }
}
