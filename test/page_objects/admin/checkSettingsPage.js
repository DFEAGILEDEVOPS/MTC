/* global element  by expect browser */

class CheckSettingsPage {
  constructor () {
    this.questionTimeLimit = element(by.css('#questionTimeLimit'))
    this.timeBetweenQuestions = element(by.css('#loadingTimeLimit'))
    this.saveChanges = element(by.css('[value=\'Save changes\']'))
    this.errorMessage = element(by.css('.error-message'))
    this.errorSummaryMessage = element(by.css('.error-summary-list'))
    this.errorSummary = element(by.css('.error-summary'))
    this.successfulChanges = element(by.css('.box-successful h2'))
  }

  updateQuestionTimeLimit (value) {
    this.questionTimeLimit.clear()
    this.questionTimeLimit.sendKeys(value)
    this.saveChanges.click()
  }
}

module.exports = new CheckSettingsPage()
