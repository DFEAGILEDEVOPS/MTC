// Page class for SignIn page
'use strict'
/* global element by */

class CheckSignInPage {
  constructor () {
    this.pin = element(by.css('.pin-entry'))
    this.school_pin = element(by.css('#school-pin'))
    this.pupil_pin = element(by.css('#pupil-pin'))
    this.sign_in_button = element(by.css('.button-start'))
  }


  login (pinSchool, pinPupil) {
    this.school_pin.sendKeys(pinSchool)
    this.pupil_pin.sendKeys(pinPupil)
  }
}

module.exports = new CheckSignInPage()
