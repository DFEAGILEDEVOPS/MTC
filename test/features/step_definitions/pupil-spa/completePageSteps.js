// Step definitions
/* global browser expect */

const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the complete page$/, function () {
    return browser.get(this.config.spaUrl + 'check/complete')
  })

  Then(/^I should see a complete page heading$/, function () {
    return expect(this.spaCompletePage.heading.getText()).to.eventually.equal('Thank you')
  })

  Then(/^I should see some text stating i have completed the check$/, function () {
    return expect(this.spaCompletePage.completionText.getText()).to.eventually.equal('You have completed the multiplication tables check.')
  })

  Then(/^I should be able to sign out$/, function () {
    return expect(this.spaCompletePage.signOut.isPresent()).to.eventually.be.true
  })

  When(/^I choose to sign out$/, function () {
    return this.spaCompletePage.signOut.click()
  })

  Then(/^I should be taken back to the sign in page$/, function () {
    return expect(this.spaSignInPage.schoolPin.isPresent()).to.eventually.be.true
  })
})
