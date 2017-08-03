/* global element by */

class SpaSignInSuccessPage {
  constructor () {
    this.heading = element(by.css('h1'))
    this.welcomeMessage = element(by.css('.heading-xlarge'))
    this.checkDetailsMessage = element(by.css('p.lede'))
    this.firstName = element(by.css('#first-name'))
    this.lastName = element(by.css('#last-name  '))
    this.school = element(by.css('#school'))
    this.notYouLink = element(by.css('a[href="/sign-out"]'))
    this.retry_sign_in = element(by.css('div > a[href="/sign-in"]'))
    this.readInstructions = element(by.buttonText('Read Instructions'))
  }
}

module.exports = new SpaSignInSuccessPage()
