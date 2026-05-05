const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase')

router.post('/', async (req, res) => {
  // 1. get all bins with fill >= 40%
  const { data: bins, error: binError } = await supabase
    .from('bins')
    .select('*')
    .gte('fill_pct', 40)
    .order('fill_pct', { ascending: false })

  if (binError) return res.status(500).json({ error: binError.message })

  // 2. get all trucks
  const { data: trucks, error: truckError } = await supabase
    .from('trucks')
    .select('*')

  if (truckError) return res.status(500).json({ error: truckError.message })
  if (!trucks.length) return res.status(400).json({ error: 'No trucks available' })
  if (!bins.length) return res.status(200).json({ message: 'No bins need collection' })

  // 3. delete old stops
  await supabase.from('stops').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 4. split bins evenly across trucks
  const routes = []
  const perTruck = Math.ceil(bins.length / trucks.length)

  for (let i = 0; i < trucks.length; i++) {
    const chunk = bins.slice(i * perTruck, (i + 1) * perTruck)
    const stops = chunk.map((bin, seq) => ({
      truck_id:  trucks[i].id,
      bin_id:    bin.id,
      sequence:  seq + 1,
      collected: false,
    }))

    if (stops.length > 0) {
      await supabase.from('stops').insert(stops)
    }

    routes.push({
      truck:    trucks[i].name,
      truck_id: trucks[i].id,
      stops:    chunk.map((b, idx) => ({
        sequence: idx + 1,
        bin_id:   b.id,
        lat:      b.lat,
        lng:      b.lng,
        fill_pct: b.fill_pct,
      })),
    })
  }

  res.json({ routes, total_bins: bins.length, skipped: (await supabase.from('bins').select('*').lt('fill_pct', 40)).data?.length || 0 })
})

module.exports = router
