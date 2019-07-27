const mongoose = require('mongoose')
const Schema = mongoose.Schema

const urlSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  shorten: {
    type: String
  }
})

module.exports = mongoose.model('', urlSchema)