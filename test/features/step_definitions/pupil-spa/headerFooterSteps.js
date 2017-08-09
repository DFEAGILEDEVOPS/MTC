// Step definitions
/* global  expect */

const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {

  Then(/^I should see a feedback text on the page$/, function () {
    return expect(this.spaSignInPage.feedback.getText()).to.eventually.to.equal('This is a new service – your feedback will help us to improve it.')
  })

  Then(/^I should see a global header$/, function () {
    return expect(this.spaSignInPage.globalHeader.isPresent()).to.eventually.be.true
  })

  Then(/^I should see a footer with a link to crown copyright$/, function () {
    return expect(this.spaSignInPage.footerLink.getAttribute('href')).to.eventually.to.equal('http://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/copyright-and-re-use/crown-copyright/')
  })
})
