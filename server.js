const express = require('express')

const app = express()

app.get('/', (_, res) => {
  res.sendStatus(200)
})

const port = 5000
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
