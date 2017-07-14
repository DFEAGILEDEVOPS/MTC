// Step definitions

const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given('I have logged in', function (callback) {
    browser.get(this.config.checkUrl)
    this.Mongo.expirePin('Automated', 'Account', 9991999, false)
    this.Mongo.resetPin('Automated', 'Account', 9991999, '9999a')
    this.checkSignInPage.login("abc12345","9999a")
    this.checkSignInPage.sign_in_button.click()
  })
  When('I start the check', function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback()
  })
  Then('I should have {int} seconds before i see the first question', function (int, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback()
  })
})
