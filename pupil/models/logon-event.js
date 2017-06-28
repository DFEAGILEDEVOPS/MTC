const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogonEvent = new Schema({
  sessionId: {type: String, required: true },
  isAuthenticated: {type: Boolean, required: true},
  errorMsg: [ String ],

  // 4 digit PIN fields only
  firstCharacterOfSurname: String,
  pin4Digit: { type: String, trim: true },
  dobDay: { type: Number, min: 1, max: 31 },
  dobMonth: { type: Number, min: 1, max: 12 },

  // 5 Digit PIN fields only
  school: { type: Number, ref: 'School' },
  schoolPin: { type: String },
  pupil: { type: Schema.Types.ObjectId, ref: 'Pupil' },
  pupilPin: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LogonEvent', LogonEvent);
