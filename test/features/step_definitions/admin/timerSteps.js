// Step definitions
/* global browser expect */

const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the admin page$/, function () {
    browser.manage().deleteAllCookies()
    browser.get(this.config.adminUrl)
    // this.waitForVisibility(this.signIn.usernameField, 2000)
    this.signIn.login('teacher1', 'password')
    expect(this.signIn.heading.getText()).to.eventually.to.equal('Example School One')
  })

  Given(/^I am on the check settings page$/, function () {
    browser.get(this.config.adminUrl + 'administrator')
    return expect(this.administratorPage.checkSettings.isPresent()).to.eventually.be.true
  })

  Then(/^I should see that Question time limit is set to default (\d) seconds$/, function (int) {
    this.administratorPage.checkSettings.click()
    expect(this.checkSettingsPage.questionTimeLimit.isPresent()).to.eventually.be.true
    return expect(this.checkSettingsPage.questionTimeLimit.getAttribute('value')).to.eventually.to.equal(String(int))
  })

  Given(/^I have updated the Question time limit to (\d) seconds$/, function (int) {
    browser.get(this.config.adminUrl + 'administrator')
    expect(this.administratorPage.checkSettings.isPresent()).to.eventually.be.true
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateQuestionTimeLimit(int)
    return expect(this.checkSettingsPage.successfulChanges.getText()).to.eventually.to.equal('Changes have been saved')
  })

  Then(/^I should see that Question time limit is set to (\d+) seconds$/, function (int) {
    browser.get(this.config.adminUrl + 'administrator')
    expect(this.administratorPage.checkSettings.isPresent()).to.eventually.be.true
    this.administratorPage.checkSettings.click()
    return expect(this.checkSettingsPage.questionTimeLimit.getAttribute('value')).to.eventually.to.equal(String(int))
  })

  When(/^I attempt to enter Question time limit as (.*) seconds$/, function (value) {
    browser.get(this.config.adminUrl + 'administrator')
    this.waitForVisibility(this.administratorPage.checkSettings, 2000)
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateQuestionTimeLimit(value)
    return expect(this.checkSettingsPage.successfulChanges.isPresent()).to.become(false)
  })

  Then(/^I should see a validation error for Question time limit$/, function () {
    expect(this.checkSettingsPage.errorSummary.isPresent()).to.eventually.be.true
    expect(this.checkSettingsPage.errorSummaryMessage.getText()).to.eventually.to.equal('Question time limit requires a number between 1 and 60, up to two decimals are valid')
    expect(this.checkSettingsPage.errorMessage.getText()).to.eventually.to.equal('Question time limit requires a number between 1 and 60, up to two decimals are valid')
  })

  When(/^I attempt to enter Question time limit as (\d)$/, function (float) {

  })

  When(/^I update the Question time limit from (\d) to (\d) seconds$/, function (int, int2) {

  })

  Then(/^I should see a record that has date and time of the change in database$/, function () {

  })

  Then(/^I should see a historic record appended in the database$/, function () {

  })

  Then(/^I should see that Time between questions is set to default {int} seconds$/, function (int) {

  })

  Given(/^I have updated the Time between questions to (\d) seconds$/, function (int) {

  })

  When(/^I attempt to enter Time between questions as (\d) seconds$/, function (stringInDoubleQuotes) {

  })

  Then(/^I should see a validation error for Time between questions$/, function () {

  })

  When(/^I update the Time between questions from (\d) to (\d) seconds$/, function (int, int2) {

  })

  Then(/^I should see a record that has date and time of the change in database$/, function () {

  })

  Then(/^I should see a historic record appended in the database$/, function () {

  })
})
