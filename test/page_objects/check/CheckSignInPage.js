/* global element by */

class CheckSignInPage {
  constructor () {
    this.pin = element(by.css('.pin-entry'))
    this.schoolPin = element(by.css('#school-pin'))
    this.pupilPin = element(by.css('#pupil-pin'))
    this.signInButton = element(by.css('.button-start'))
  }

  login (pinSchool, pinPupil) {
    this.schoolPin.sendKeys(pinSchool)
    this.pupilPin.sendKeys(pinPupil)
  }
}

module.exports = new CheckSignInPage()
