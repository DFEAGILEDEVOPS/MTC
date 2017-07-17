/* global element by */

class ConfirmationPage {
  constructor () {
    this.readInstructions = element(by.css("input[value='Read Instructions']"))
  }
}
module.exports = new ConfirmationPage()
