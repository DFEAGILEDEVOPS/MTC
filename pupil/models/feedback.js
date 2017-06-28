const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const maxMessageLength = [
  1200,
  'You have exceeded the word limit'
];

const inputStates = [
  'Touchscreen',
  'Mouse',
  'Keyboard',
  'Mix of the above'
];

const satisfactionStates = [
  'Very easy',
  'Easy',
  'Neither easy or difficult',
  'Difficult',
  'Very difficult'
];

const Feedback = new Schema({
  sessionId: String,
  inputType: {
    type: String,
    enum: inputStates,
    required: 'Please choose an option below'
  },
  satisfactionRating: {
    type: String,
    enum: satisfactionStates,
    required: 'Please choose an option below'
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  comment: {
    type: String,
    trim: true,
    maxlength: maxMessageLength
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', Feedback, 'feedback');
