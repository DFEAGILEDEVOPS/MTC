/* global element by */

class SpaConfirmationPage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.pageInstructions = element(by.css('.lede'))
    this.foreName = element(by.css('#first-name'))
    this.lastName = element(by.css('#last-name'))
    this.schoolName = element(by.css('#school'))
    this.pupilDetails = '' // Container for pupil's details
    this.schoolDetails = '' // Container for school's details
  }
}

module.exports = new SpaConfirmationPage()
