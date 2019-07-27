const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const password = require('./password')
const Url = require('./models/url')

const db = mongoose.connection
mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true })
db.on('error', () => {
  console.log('mongoose error')
})
db.once('open', () => {
  console.log('mongoose connected')
})

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/url', async (req, res) => {

  const { url } = req.body
  let errors = []
  // 產生新 url
  const shortnewUrl = await password.shortUrl()

  // 檢查原始網址是否存在
  Url.findOne({ url: url }).then(urls => {
    // 產生5碼亂碼
    if (urls) {
      errors.push({ message: `原來網址${urls.url} 已有產生的短網址http://localhost/${urls.shorten}` })
    }

    if (errors.length > 0) {
      res.render('index', { errors })
    } else {
      const newUrl = new Url({
        url: req.body.url,
        shorten: shortnewUrl
      })
      // 儲存到資料庫
      newUrl.save(error => {
        if (error) return console.error(error)
        return res.render('result')
      })
    }
  }).catch((err) => { console.log(err) })
})

app.get('/:shorten', async (req, res) => {
  const shurl = req.params.shorten
  const orgrl = await Url.findOne({shorten: shurl}).exec()

  if (orgrl) {
    let urlOrg = orgrl.url
    res.redirect(urlOrg)
  }
})

app.listen(port, () => {
  console.log(`App is running on ${port}`)
})