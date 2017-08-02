/* global element by */

class SpaSignInFailurePage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.instructionsMessage = element(by.css('p.lede'))
    this.retry_sign_in = element(by.css('div > a[href="/sign-in"]'))
  }

}

module.exports = new SpaSignInFailurePage()
