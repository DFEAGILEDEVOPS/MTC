/* global before after */

const Application = require('spectron').Application
const path = require('path')

before(function () {
  this.app = new Application({
    path: path.join(__dirname, '../node_modules/.bin/electron'),
    args: [path.join(__dirname, '..')]
  })
  return this.app.start()
})

after(function () {
  if (this.app && this.app.isRunning()) {
    return this.app.stop()
  }
})
