var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchoolPin = new Schema({
  _id: { type: String },
});

module.exports = mongoose.model('SchoolPin', SchoolPin);
