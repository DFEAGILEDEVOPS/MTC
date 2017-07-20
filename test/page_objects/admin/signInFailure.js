// Page class for SignIn Failure page
'use strict'
/* global element by */

class SignInFailurePage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.instructions = element(by.css('p.lede'))
  }
}

module.exports = new SignInFailurePage()
