const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PupilPin = new Schema({
  _id: { type: String },
});

module.exports = mongoose.model('PupilPin', PupilPin);
