const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')

// mongoose setting
const mongoose = require('mongoose')
const db = mongoose.connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useCreateIndex: true
})
db.on('error', () => {
  console.log('mongoose error')
})
db.once('open', () => {
  console.log('mongoose connected')
})

// template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())

// 路由
app.use('/', require('./routes/home.js'))

app.listen(process.env.PORT || port, () => {
  console.log(`App is running on ${port}`)
})