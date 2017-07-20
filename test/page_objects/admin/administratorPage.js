/* global element by */
class AdministratorPage {
  constructor () {
    this.checkSettings = element(by.css("[href='/administrator/check-settings']"))
  }
}

module.exports = new AdministratorPage()
