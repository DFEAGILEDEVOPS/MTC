const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pin = new Schema({
  _id: { type: String },
});

module.exports = mongoose.model('Pin', Pin);
