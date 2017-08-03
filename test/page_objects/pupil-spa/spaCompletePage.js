/* global element by */

class CompletePage {
  constructor () {
    this.heading = element(by.css('.heading-xlarge'))
    this.completionText = element(by.css('p.text:nth-child(2)'))
    this.signOut = element(by.css('a[href="/sign-out"]'))
    this.feedback = element(by.css('p > a[href="/check/feedback"]'))
  }
}

module.exports = new CompletePage()
