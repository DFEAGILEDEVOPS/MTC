/* global element by */

class SpaWarmUpStartPage {
  constructor () {
    this.heading = element(by.css('app-root > h1'))
    this.preLoad = element(by.css('.preload'))
  }
}

module.exports = new SpaWarmUpStartPage()
