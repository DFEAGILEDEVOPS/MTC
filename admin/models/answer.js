const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PASS_MARK = 65;
const date = new Date;

mongoose.Promise = global.Promise;

/**
 * This collection is expected to be large.  There will be the same number of documents created as questions,
 * (lambda architecture - no updates, no deletes) so if there are 30 questions, then there would be 30 documents per
 * test, and 600,000 tests per year, e.g. 18 million docs per year.  This collection will need to be rotated, hence
 * the '-<year>' suffix on the collection name.  This may need re-visiting, e.g. if the check window ws over year end
 * (December - January) then we may want to re-consider this approach.
 */

const Answer = new Schema({
  sessionId: { type: String, required: true },
  testId: { type: String, required: true },
  logonEvent: { type: Schema.Types.ObjectId, ref: 'LogonEvent', required: true },
  creationDate: { type: Date, default: Date.now },
  answers: [{
    _id: false,
    answerDate: { type: Date, required: true },
    input: { type: String, trim: true },
    factor1: { type: Number, min: 0, max: 12, required: true },
    factor2: { type: Number, min: 0, max: 12, required: true },
    isCorrect: Boolean,
    registeredInputs: [{
      _id: false,
      input: { type: String, required: true  },
      eventType: { type: String, required: true  },
      clientInputDate: { type: Date, required: true },
    }]
  }],
  result: {
    correct: Number,
    isPass: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.model('Answer', Answer, 'answers-' + date.getFullYear());
