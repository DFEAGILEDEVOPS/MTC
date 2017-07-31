/* global element by */

class SpaSignInPage {
  constructor () {
    this.logo = element(by.css('.organisation-logo'))
    this.logoText = element(by.css('.logo-text'))
    this.heading = element(by.css('.heading-xlarge'))
    this.welcomeMessage = element(by.css('.lede'))
    this.pin = element(by.css('.pin-entry'))
    this.schoolPin = element(by.css('#school-pin'))
    this.pupilPin = element(by.css('#pupil-pin'))
    this.signInButton = element(by.css('button'))
  }

  login (pinSchool, pinPupil) {
    this.schoolPin.sendKeys(pinSchool)
    this.pupilPin.sendKeys(pinPupil)
  }
}

module.exports = new SpaSignInPage()
