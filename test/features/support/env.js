// Environment global declaration
const configure = function () {
  this.setDefaultTimeout(240 * 1000)
}

const chai = require('chai')
const chaiSmoothie = require('chai-smoothie')
chai.use(chaiSmoothie)
global.expect = chai.expect
module.exports = configure
