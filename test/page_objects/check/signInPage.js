// Page class for SignIn page
'use strict'
/* global element by */
/* global browser browser */

class CheckSignIn {
  constructor () {
    this.pin = element(by.css('.pin-entry'))
    this.school_pin = element(by.css('#school-pin'))
    this.pupil_pin = element(by.css('#pupil-pin'))
    this.sign_in_button = element(by.css('.button-start'))
  }

  load () {
    browser.get('#/sign_in')
  }

  login (pinSchool, pinPupil) {
    this.school_pin.send_keys(pinSchool)
    this.pupil_pin.send_keys(pinPupil)
  }
}

module.exports = new CheckSignIn()
