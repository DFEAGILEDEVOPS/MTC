const MarkedAnswer = require('./marked-answer.class')

module.exports = class MarkedCheck {
  constructor (checkCode, schoolGuid, markedAnswersString, mark, markedAt) {
    this.checkCode = checkCode
    this.schoolGuid = schoolGuid
    this.mark = Number(mark)
    this.markedAt = new Date(markedAt)
    const rawMarkedAnswers = JSON.parse(markedAnswersString)
    this.markedAnswers = rawMarkedAnswers.map(o => {
      return new MarkedAnswer(o.factor1, o.factor2, o.answer, o.isCorrect, o.question, o.clientTimestamp, o.sequenceNumber)
    })
  }
}
