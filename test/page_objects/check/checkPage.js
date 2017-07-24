/* global element by */
class CheckPage {
  constructor () {
    this.preload = element(by.css('.preload'))
    this.pageTimeSettings = element(by.css('#js-page-time-settings'))
    this.loadingTime = element(by.css('#js-preload-div'))
  }
}

module.exports = new CheckPage()
