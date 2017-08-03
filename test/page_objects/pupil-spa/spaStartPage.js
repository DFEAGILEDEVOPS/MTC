/* global element by */

class SpaStartPage {
  constructor () {
    this.heading = element(by.css('app-root > h1'))
    this.instructionsTitle = element(by.css('.heading-xlarge'))
    this.instructions = element(by.css('.list-bullet'))
    this.warmUpIntroLink = element(by.css('#start-now-button'))
  }
}

module.exports = new SpaStartPage()
