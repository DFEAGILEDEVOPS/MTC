module.exports = class MarkedAnswer {
  constructor (factor1, factor2, answer, isCorrect, question, clientTimestamp, sequenceNumber) {
    this.factor1 = parseInt(factor1, 10)
    this.factor2 = parseInt(factor2, 10)
    this.question = question
    this.answer = answer
    this.isCorrect = isCorrect
    this.sequenceNumber = parseInt(sequenceNumber, 10)
    this.clientTimestamp = new Date(clientTimestamp)
  }
}
