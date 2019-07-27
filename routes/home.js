const express = require('express')
const router = express()
const { shortUrl, checkInput } = require('../valids/valid')
const Url = require('../models/url')

router.get('/', (req, res) => {
  res.render('index')
})

router.post('/url', async (req, res) => {
  const { url } = req.body
  let errors = []
  
  // 從 valids/valid.js 檢查 req.body 的網址並加上 https
  const httpCheck = checkInput(url)
  // 從 valids/valid.js 產生新短網址
  const shortNewUrl = await shortUrl()

  if (!url) { // req.body 不可以是空的
    errors.push({ message: '必須填寫網址' })
  }
  if (errors.length > 0) {
    res.render('index', { errors })
  } else {
    // 檢查原始網址是否存在
    Url.findOne({ url: httpCheck }).then(urls => {
      if (urls) { // 與資料庫原始網址相符合的話顯示提示
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
        const newUrl = new Url({ // 資料庫沒有符合的網址後產生新網址資料
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

router.get('/:shorten', async (req, res) => {
  const paramsUrl = req.params.shorten
  // 比對資料庫是否有相符合短網址
  const urlChecked = await Url.findOne({ shorten: paramsUrl }).exec()
  let errors = []

  // 沒有相符合的網址
  if (!urlChecked) {
    errors.push({ message: '網址不存在' })
    res.render('index', { errors })
  }
  // 有相符合的網址導向網站
  if (urlChecked) {
    let originalUrl = urlChecked.url
    res.redirect(originalUrl)
  }
})

module.exports = router