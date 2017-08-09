/* global element by */

class ConfirmationPage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.pageInstructions = element(by.css('.lede'))
    this.firstName = element(by.css('#first-name'))
    this.lastName = element(by.css('#last-name'))
    this.schoolName = element(by.css('#school'))
  }
}

module.exports = new ConfirmationPage()
