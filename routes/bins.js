const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase')

// GET all bins
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('bins').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST add a bin
router.post('/', async (req, res) => {
  const { lat, lng, fill_pct } = req.body
  const { data, error } = await supabase
    .from('bins')
    .insert([{ lat, lng, fill_pct }])
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data[0])
})

// PUT update fill level
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { fill_pct } = req.body
  const { data, error } = await supabase
    .from('bins')
    .update({ fill_pct, last_updated: new Date() })
    .eq('id', id)
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

// DELETE a bin
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const { error } = await supabase.from('bins').delete().eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Bin deleted' })
})

module.exports = router
