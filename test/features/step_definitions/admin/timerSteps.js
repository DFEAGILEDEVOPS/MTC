// Step definitions
/* global browser expect */
const moment = require('moment')
const {defineSupportCode} = require('cucumber')
defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the admin page$/, function () {
    browser.get(this.config.adminUrl)
    this.signIn.login('teacher1', 'password')
    expect(this.signIn.heading.getText()).to.eventually.to.equal('Example School One')
  })

  Given(/^I am on the check settings page$/, function () {
    browser.get(this.config.adminUrl + 'administrator')
    return expect(this.administratorPage.checkSettings.isPresent()).to.eventually.be.true
  })

  Given(/^I have updated the Question time limit to (.*) seconds$/, function (int) {
    browser.get(this.config.adminUrl + 'administrator')
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateQuestionTimeLimit(int)
    return expect(this.checkSettingsPage.successfulChanges.getText()).to.eventually.to.equal('Changes have been saved')
  })

  Then(/^I should see that Question time limit is set to (default )*(.*) seconds$/, function (flag, int) {
    browser.get(this.config.adminUrl + 'administrator')
    this.administratorPage.checkSettings.click()
    return expect(this.checkSettingsPage.questionTimeLimit.getAttribute('value')).to.eventually.to.equal(int)
  })

  When(/^I attempt to enter Question time limit as (.*) seconds$/, function (value) {
    browser.get(this.config.adminUrl + 'administrator')
    this.waitForVisibility(this.administratorPage.checkSettings, 2000)
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateQuestionTimeLimit(value)
    return expect(this.checkSettingsPage.successfulChanges.isPresent()).to.become(false)
  })

  Then(/^I should see a validation error for Question time limit$/, function () {
    expect(this.checkSettingsPage.errorSummaryMessage.getText()).to.eventually.to.equal('Question time limit requires a number between 1 and 60, up to two decimals are valid')
    return expect(this.checkSettingsPage.errorMessage.getText()).to.eventually.to.equal('Question time limit requires a number between 1 and 60, up to two decimals are valid')
  })

  When(/^I update the Question time limit from (\d) to (\d) seconds$/, function (int, int2) {
    browser.get(this.config.adminUrl + 'administrator')
    this.waitForVisibility(this.administratorPage.checkSettings, 2000)
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateQuestionTimeLimit(int)
    this.checkSettingsPage.updateQuestionTimeLimit(int2)
    this.int = int2
    return expect(this.checkSettingsPage.successfulChanges.getText()).to.eventually.to.equal('Changes have been saved')
  })
  When(/^I update the Time between questions from (\d) to (\d) seconds$/, function (int, int2) {
    browser.get(this.config.adminUrl + 'administrator')
    this.waitForVisibility(this.administratorPage.checkSettings, 2000)
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateTimeBetweenQuestions(int)
    this.checkSettingsPage.updateTimeBetweenQuestions(int2)
    int = int2
    return expect(this.checkSettingsPage.successfulChanges.getText()).to.eventually.to.equal('Changes have been saved')
  })

  Then(/^I should see a record that has date and time of the Question time limit change to (\d) in database$/, function (int) {
    return this.mongo.Settings().then(function (item) {
      expect(item[0]['questionTimeLimit']).to.equal(parseInt(int))
      let date = moment(item[0]['updatedAt']).format('DD-MM-YY-h')
      let newDate = moment(new Date()).format('DD-MM-YY-h')
      expect(newDate).to.equal(date)
    }, function (err) {
      console.error('The connection is not established', err, err.stack)
    })
  })

  Then(/^I should see a historic record appended for Question Time limit change to (\d) in the database$/, function (int) {
    return this.mongo.SettingsLogs().then(function (item) {
      expect(item.slice(-1)[0]['questionTimeLimit']).to.equal(parseInt(int))
      let date = moment(item.slice(-1)[0]['updatedAt']).format('DD-MM-YY-h')
      let newDate = moment(new Date()).format('DD-MM-YY-h')
      expect(newDate).to.equal(date)
      expect(item.slice(-1)[0]['userName']).to.equal('teacher1')
      expect(item.slice(-1)[0]['emailAddress']).to.equal('teacher1')
    }, function (err) {
      console.error('The connection is not established', err, err.stack)
    })
  })

  Then(/^I should see that Time between questions is set to (default )*(.*) seconds$/, function (flag, int) {
    browser.get(this.config.adminUrl + 'administrator')
    this.administratorPage.checkSettings.click()
    return expect(this.checkSettingsPage.timeBetweenQuestions.getAttribute('value')).to.eventually.to.equal(int)
  })

  Given(/^I have updated the Time between questions to (.*) seconds$/, function (int) {
    browser.get(this.config.adminUrl + 'administrator')
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateTimeBetweenQuestions(int)
    return expect(this.checkSettingsPage.successfulChanges.getText()).to.eventually.to.equal('Changes have been saved')
  })

  When(/^I attempt to enter Time between questions as (.*) seconds$/, function (value) {
    browser.get(this.config.adminUrl + 'administrator')
    this.waitForVisibility(this.administratorPage.checkSettings, 2000)
    this.administratorPage.checkSettings.click()
    this.checkSettingsPage.updateTimeBetweenQuestions(value)
    return expect(this.checkSettingsPage.successfulChanges.isPresent()).to.become(false)
  })

  Then(/^I should see a validation error for Time between questions$/, function () {
    expect(this.checkSettingsPage.errorSummaryMessage.getText()).to.eventually.to.equal('Time between questions requires a number between 1 and 5, up to two decimals are valid')
    return expect(this.checkSettingsPage.errorMessage.getText()).to.eventually.to.equal('Time between questions requires a number between 1 and 5, up to two decimals are valid')
  })

  Then(/^I should see a record that has date and time of the Time between questions change to (\d) in database$/, function (int) {
    return this.mongo.Settings().then(function (item) {
      expect(item[0]['loadingTimeLimit']).to.equal(parseInt(int))
      let date = moment(item[0]['updatedAt']).format('DD-MM-YY-h')
      let newDate = moment(new Date()).format('DD-MM-YY-h')
      expect(newDate).to.equal(date)
    }, function (err) {
      console.error('The connection is not established', err, err.stack)
    })
  })

  Then(/^I should see a historic record appended for Time between questions change to (\d) in the database$/, function (int) {
    return this.mongo.SettingsLogs().then(function (item) {
      expect(item.slice(-1)[0]['loadingTimeLimit']).to.equal(parseInt(int))
      let date = moment(item.slice(-1)[0]['updatedAt']).format('DD-MM-YY-h')
      let newDate = moment(new Date()).format('DD-MM-YY-h')
      expect(newDate).to.equal(date)
      expect(item.slice(-1)[0]['userName']).to.equal('teacher1')
      expect(item.slice(-1)[0]['emailAddress']).to.equal('teacher1')
    }, function (err) {
      console.error('The connection is not established', err, err.stack)
    })
  })
})
