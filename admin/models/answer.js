const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

/**
 * DEPRECATED FILE - TO BE REMOVED
 */

const Answer = new Schema({
  sessionId: {type: String, required: true},
  testId: {type: String, required: true},
  logonEvent: {
    type: Schema.Types.ObjectId,
    ref: 'LogonEvent',
    required: true
  },
  pupil: {type: Schema.Types.ObjectId, ref: 'Pupil', required: true},
  school: {type: Number, ref: 'School', required: true},
  isElectron: {type: Boolean, default: false},
  creationDate: { type: Date },
  answers: [{
    _id: false,
    pageLoadDate: {type: Date, required: false},
    answerDate: {type: Date, required: true},
    input: {type: String, trim: true},
    factor1: {type: Number, min: 0, max: 12, required: true},
    factor2: {type: Number, min: 0, max: 12, required: true},
    isCorrect: Boolean,
    registeredInputs: [{
      _id: false,
      input: {type: String, required: true},
      eventType: {type: String, required: true},
      clientInputDate: {type: Date, required: true}
    }]
  }],
  result: {
    correct: Number,
    isPass: Boolean
  }
}, {timestamps: true})

module.exports = mongoose.model('Answer', Answer, 'answers')
