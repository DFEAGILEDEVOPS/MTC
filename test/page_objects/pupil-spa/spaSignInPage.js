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
    this.signInButton = element(by.buttonText('Sign in'))
  }

  login (pinSchool, pinPupil) {
    this.schoolPin.sendKeys(pinSchool)
    this.pupilPin.sendKeys(pinPupil)
    this.signInButton.click()
  }

  realLogin (pupilPin, schoolPin) {
    this.pupilPin.sendKeys(pupilPin)
    this.schoolPin.sendKeys(schoolPin)
    this.signInButton.click()
  }
}

module.exports = new SpaSignInPage()
