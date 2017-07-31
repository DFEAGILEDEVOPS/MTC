// Step definitions
/* global browser expect */

const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am logged in on pupil page$/, function () {
    this.mongo.SetExpirePin('Automated', 'Account', 9991999, false)
    this.mongo.ResetPin('Automated', 'Account', 9991999, '9999a')
    browser.get(this.config.checkUrl)
    this.checkSignInPage.login('abc12345', '9999a')
    this.checkSignInPage.signInButton.click()
    return expect(this.confirmationPage.readInstructions.isPresent()).to.eventually.be.true
  })
  When(/^I start the check$/, function () {
    this.confirmationPage.readInstructions.click()
    browser.get(this.config.checkUrl + 'warm-up/complete')
    this.startPage.startCheck.click()
    return expect(this.checkPage.preload.isPresent()).to.eventually.be.true
  })
  Then(/^I should have (\d+) seconds before i see the first question$/, function (int) {
    this.waitForVisibility(this.checkPage.preload, int * 1000)
    this.waitForInVisibility(this.checkPage.preload, int * 1000)
    return expect(this.checkPage.preload.isPresent()).to.eventually.be.true
  })
  Then(/^I should see the Question time limit is set to (\d+) seconds in the check page$/, function (int) {
    this.waitForVisibility(this.checkPage.pageTimeSettings, int * 1000)
    return expect(this.checkPage.pageTimeSettings.getAttribute('data-value')).to.eventually.to.equal(int.toString())
  })
  Then(/^I should see the Time between questions is set to (\d+) seconds in the check page$/, function (int) {
    this.waitForVisibility(this.checkPage.loadingTime, int * 1000)
    return expect(this.checkPage.loadingTime.getAttribute('data-value')).to.eventually.to.equal(int.toString())
  })
})
