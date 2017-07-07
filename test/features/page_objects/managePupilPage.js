/* eslint-disable no-undef */
'use strict'

class ManagePupilPage {
  get () {
    browser.get('#//school/manage-pupils')
  };
}

module.exports = new ManagePupilPage()
