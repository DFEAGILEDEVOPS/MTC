// Page class for Landing page
'use strict'
/* global element by */

class LandingPage {
  constructor () {
    this.home = element(by.css('#content .breadcrumbs a'))
    this.breadcrumb = element(by.css('#content .breadcrumbs'))
  }
}

module.exports = new LandingPage()
