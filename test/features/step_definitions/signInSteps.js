// Step definitions
/* global browser expect config signIn landingPage signInFailure */

const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the sign in page$/, function (callback) {
    browser.get(config.appUrl)
    expect(signIn.usernameField).to.eventually.be.present
            .then(callback)
  })

  Then(/^I should see a page heading$/, function (callback) {
    expect(signIn.heading).to.eventually.have.text('Check Development Service')
            .then(callback)
  })

  Then(/^I should see instructions$/, function (callback) {
    expect(signIn.instructions).to.eventually.have.text('Sign-in to access the Check Development Service')
            .then(callback)
  })

  Given(/^I have entered valid credentials$/, function (callback) {
    browser.get(config.appUrl)
    signIn.login('teacher1', 'password')
    callback()
  })

  When(/^I sign in$/, function (callback) {
    signIn.signIn.click()
    callback()
  })

  Then(/^I should be taken to the school landing page$/, function (callback) {
    expect(landingPage.breadcrumb).to.eventually.have.text('School Home')
            .then(callback)
  })

  Given(/^I have entered invalid credentials$/, function (callback) {
    browser.get(config.appUrl)
    signIn.login('teacher1', 'wrong')
    callback()
  })

  Then(/^I should be taken to the failed login page$/, function (callback) {
    expect(signInFailure.heading).to.eventually.have.text('Unable to confirm details')
    expect(signInFailure.instructions).to.eventually.have.text('The details entered do not match our records.')
            .then(callback)
  })
})
