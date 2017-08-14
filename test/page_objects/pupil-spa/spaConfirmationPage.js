/* global element by */

class SpaConfirmationPage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.readInstructions = element(by.css('app-login-success .button'))
    this.foreName = element(by.css('#first-name strong'))
    this.lastName = element(by.css('#last-name strong'))
    this.schoolName = element(by.css('#school strong'))
    this.pupilDetails = '' // Container for pupil's details
    this.schoolDetails = '' // Container for school's details
  }
}

module.exports = new SpaConfirmationPage()
