const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

const app = express()

var whitelist = ['http://localhost:3000']

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

app.use(cors())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use((req, res, next) => {
    bodyParser.json({ limit: '50mb', extended: true })(req, res, (err) => {
      if (err) {
        console.error(err)
        return res.sendStatus(400) // Bad request
      }
      next()
    })
  })

  app.use(bodyParser.urlencoded({ extended: true }))

  const db = process.env.MONGO_URI

  mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))


  app.get('/', (req, res) => {
    res.json({ message: 'BugBase API' })
  })

  app.use('/api/auth', require('./routes/routes'))

  const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})


