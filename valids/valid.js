const Url = require('../models/url')

module.exports = {
  shortUrl : async () => {
    let randomText = ''
    do {
      const stringPossible = 'abcdfrghijklmnopqrlstuvxyzABCDEFGHIJKLMNOPQRLSTUVXYZ0123456789'
      for (let i = 0; i < 5; i++) {
        randomText += stringPossible.charAt(Math.floor(Math.random() * stringPossible.length))
      }
      const newUrl = await Url.findOne({ shorten: randomText })
      if (!newUrl) {
        return randomText
      }
    } while (newUrl)
  },
  checkInput : url => {
    const httpRegex = /^https?:\/\//
    const handleUrl = (httpRegex.test(url)) ? url : `https://${url}`
    return handleUrl
  }
}