// Step definitions
/* global browser expect */

const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
  Then(/^I have read the instructions$/, function () {
    browser.get(this.config.spaUrl + 'sign-in')
    this.spaSignInPage.login('abc12345', '9999a')
    this.spaSignInSuccessPage.readInstructions.click()
    return this.spaStartPage.warmUpIntroLink.click()
  })

  Then(/^I choose to start the warm up questions$/, function () {
    return this.spaWarmUpIntroPage.startLink.click()
  })

  Then(/^I should have (\d+) seconds before I see the first question$/, function (int) {
    this.waitForVisibility(this.spaWarmUpQuestionPage.question, int * 1100)
    return expect(this.spaWarmUpQuestionPage.question.isPresent()).to.eventually.be.true
  })
})
