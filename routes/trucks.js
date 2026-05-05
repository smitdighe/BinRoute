const express = require('express')
const router = express.Router()
const supabase = require('../db/supabase')

// GET all trucks
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('trucks').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST add a truck
router.post('/', async (req, res) => {
  const { name } = req.body
  const { data, error } = await supabase
    .from('trucks')
    .insert([{ name }])
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data[0])
})

// PUT update truck status
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const { data, error } = await supabase
    .from('trucks')
    .update({ status })
    .eq('id', id)
    .select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data[0])
})

module.exports = router
