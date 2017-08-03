/* global element by */

class SpaWarmUpIntroPage {
  constructor () {
    this.heading = element(by.css('app-root > h1'))
    this.title = element(by.css('.heading-xlarge'))
    this.instructions = element(by.css('p.lede'))
    this.startLink = element(by.css('#start-now-button'))
  }
}

module.exports = new SpaWarmUpIntroPage()
