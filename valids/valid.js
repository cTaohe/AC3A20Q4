const Url = require('../models/url')

module.exports = {
  // 產生唯一的隨機短網址
  shortUrl : async () => {
    let randomText = ''
    do {
      const stringPossible = 'abcdfrghijklmnopqrlstuvxyzABCDEFGHIJKLMNOPQRLSTUVXYZ0123456789'
      for (let i = 0; i < 5; i++) {
        randomText += stringPossible.charAt(Math.floor(Math.random() * stringPossible.length))
      }
      // 比對資料庫有沒有重複的短網址
      const newUrl = await Url.findOne({ shorten: randomText })
      
      // 沒有重複就回傳
      if (!newUrl) {
        return randomText
      }
    } while (newUrl) // 有重複就繼續迴圈
  },
  // 檢查網址是否有加上 http 或 https
  checkInput : url => {
    const httpRegex = /^https?:\/\//
    const handleUrl = (httpRegex.test(url)) ? url : `https://${url}` //沒有 https 就加上
    return handleUrl
  }
}