// Environment global variables declaration
var configure = function () {
    this.setDefaultTimeout(240 * 1000);
};

const util = require('util');
var chai = require('chai');
var chaiSmoothie = require('chai-smoothie');
var EC = protractor.ExpectedConditions;
var config;
chai.use(chaiSmoothie);
global.expect = chai.expect;
global.util = util;
global.EC = EC;
global.config = config;
module.exports = configure;