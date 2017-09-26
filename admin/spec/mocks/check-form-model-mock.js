class CheckFormModelMock {
  constructor (cb) {
    this.done = cb
  }
  findOne () { return this }
  lean () { return this }
  exec () { return this.done() }
}

module.exports = CheckFormModelMock
