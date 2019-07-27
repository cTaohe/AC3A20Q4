const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const { shortUrl, checkInput } = require('./valids/valid')
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
  const httpCheck = checkInput(url)
  console.log(req.headers.host)
  let errors = []
  // 產生新 url
  const shortNewUrl = await shortUrl()

  if (!url) {
    errors.push({ message: '必須填寫網址' })
  }
  if (errors.length > 0) {
    res.render('index', { errors })
  } else {
    // 檢查原始網址是否存在
    Url.findOne({ url: httpCheck }).then(urls => {
      // 產生5碼亂碼
      if (urls) {
        errors.push({ 
          message: `
            原來網址<a href="${urls.url}">${urls.url}</a>已有產生的短網址
            <a href="${req.protocol}://${req.headers.host}/${urls.shorten}">
              ${req.protocol}://${req.headers.host}/${urls.shorten}
            </a>
            `
        })
        res.render('index', { errors })
      } else {
        const newUrl = new Url({
          url: httpCheck,
          shorten: shortNewUrl
        })
        // 儲存到資料庫
        newUrl.save(error => {
          if (error) return console.error(error)
          return res.render('result', { shortNewUrl })
        })
      }
    }).catch((err) => { console.log(err) })
  }
})

app.get('/:shorten', async (req, res) => {
  const paramsUrl = req.params.shorten
  const urlChecked = await Url.findOne({ shorten: paramsUrl }).exec()
  let errors = []
  if (!urlChecked) {
    errors.push({ message: `原來網址${urls.url} 已有產生的短網址http://localhost:3000/${urls.shorten}` })
    res.render('index', {errors})
  }
  if (urlChecked) {
    let originalUrl = urlChecked.url
    res.redirect(originalUrl)
  }
})

app.listen(port, () => {
  console.log(`App is running on ${port}`)
})