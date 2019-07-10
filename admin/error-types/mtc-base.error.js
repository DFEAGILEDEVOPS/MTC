class mtcBaseError extends Error {
  constructor (message, userMessage = '') {
    super(message)
    this.name = 'mtcBaseError'
    this.userMessage = userMessage
  }
}

module.exports = mtcBaseError
