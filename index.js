const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/bins',     require('./routes/bins'))
app.use('/trucks',   require('./routes/trucks'))
app.use('/optimize', require('./routes/optimize'))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})