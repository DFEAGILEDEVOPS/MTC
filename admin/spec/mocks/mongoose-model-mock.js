class MongooseModelMock {
  constructor (cb) {
    this.done = cb
  }
  findOne () { return this }
  lean () { return this }
  updateOne () { return this.done() }
  exec () { return this.done() }
}

module.exports = MongooseModelMock
