'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise

const Group = new Schema({
  name: {
    type: String,
    required: true
  },
  pupils: {},
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {timestamps: true})

module.exports = mongoose.model('Group', Group)
