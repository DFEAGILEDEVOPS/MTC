// Environment global declaration
const configure = function () {
  this.setDefaultTimeout(240 * 1000)
}

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
global.expect = chai.expect
module.exports = configure
