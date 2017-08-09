// Step definitions
/* global browser expect */

const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the SPA sign in page$/, function () {
    return browser.get(this.config.spaUrl + 'sign-in')
  })

  Then(/^I should see a STA logo$/, function () {
    return expect(this.spaSignInPage.logo.isPresent()).to.eventually.be.true
  })

  Then(/^I should see a sign in page heading$/, function () {
    return expect(this.spaSignInPage.heading.getText()).to.eventually.to.equal('Multiplication tables check')
  })

  Then(/^I should see some sign in page intro text$/, function () {
    return expect(this.spaSignInPage.welcomeMessage.isPresent()).to.eventually.be.true
  })

  Then(/^I should see a sign in button$/, function () {
    return expect(this.spaSignInPage.signInButton.isPresent()).to.eventually.be.true
  })

  When(/^I attempt to login with just a school pin$/, function () {
    this.spaSignInPage.schoolPin.sendKeys('abc12345')
    return this.spaSignInPage.signInButton.click()
  })

  Then(/^I should be taken to the sign in failure page$/, function () {
    return expect(browser.getCurrentUrl()).to.eventually.to.include('/sign-in-failure')
  })

  When(/^I attempt to login with just a pupil pin$/, function () {
    this.spaSignInPage.pupilPin.sendKeys('9999a')
    return this.spaSignInPage.signInButton.click()
  })

  When(/^I have logged in$/, function () {
    return this.spaSignInPage.login('abc12345', '9999a')
  })

  When(/^I should be taken to the instructions page$/, function () {
    return expect(this.spaConfirmationPage.pageInstructions.isPresent()).to.eventually.be.true
  })

  When(/^I have not entered any sign in details$/, function () {
    return this.spaSignInPage.signInButton.click()
  })

  When(/^I am on the SPA login failure page$/, function () {
    return browser.get(this.config.spaUrl + 'sign-in-failure')
  })

  When(/^I want to try logging in again$/, function () {
    return this.spaSignInFailurePage.retry_sign_in.click()
  })

  When(/^I should be taken to the sign in page$/, function () {
    return expect(browser.getCurrentUrl()).to.eventually.to.include('/sign-in')
  })

  When(/^I should see a sign in page failure heading$/, function () {
    return expect(this.spaSignInFailurePage.heading.getText()).to.eventually.to.equal('Unable to confirm details')
  })

  When(/^I should see some text instructing me on what to do next$/, function () {
    return expect(this.spaSignInFailurePage.instructionsMessage.isPresent()).to.eventually.be.true
  })
  When(/^I am logged in with a real pupil and school pin$/, function () {
    let pupilPin = this.mongo.FindNextPupil(9991001).then(function (items) { return items[0]['pin'] })
    let schoolPin = this.mongo.SchoolPinRetriever(9991001).then(function (items) { return items[0]['schoolPin'] })
    return this.spaSignInPage.realLogin(pupilPin, schoolPin)
  })
  Then(/^I should be shown the confirmation page displaying my name$/, function () {
    return expect(this.spaConfirmationPage.pageInstructions.isPresent()).to.eventually.be.true
  })
})
