class Helpers {
  static generatePupil (length) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 5; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

    return text
  }
}

module.exports = Helpers
