// Step definitions
/* global browser  */

const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the welcome page$/, function () {
    browser.get(this.config.spaUrl + 'sign-in')
    return this.spaSignInPage.login('abc12345', '9999a')
  })
  Given(/^I am on the instructions page$/, function () {
    browser.get(this.config.spaUrl + 'sign-in')
    this.spaSignInPage.login('abc12345', '9999a')
    return this.spaSignInSuccessPage.readInstructions.click()
  })
})
