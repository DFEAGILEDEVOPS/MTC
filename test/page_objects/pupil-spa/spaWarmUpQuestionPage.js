/* global element by */

class SpaWarmUpQuestionPage {
  constructor () {
    this.heading = element(by.css('app-root > h1'))
    this.question = element(by.css('app-question'))
  }
}

module.exports = new SpaWarmUpQuestionPage()
