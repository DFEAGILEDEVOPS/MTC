// Environment global constiables declaration
const configure = function () {
  this.setDefaultTimeout(240 * 1000)
}

const chai = require('chai')
const chaiSmoothie = require('chai-smoothie')
const EC = protractor.ExpectedConditions
chai.use(chaiSmoothie)
global.expect = chai.expect
global.EC = EC
module.exports = configure
