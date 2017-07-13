/* global browser */

const {defineSupportCode} = require('cucumber')

function CustomWorld () {
  this.signIn = require('../../page_objects/admin/signInPage')
  this.landingPage = require('../../page_objects/admin/landingPage')
  this.signInFailure = require('../../page_objects/admin/signInFailure')
  this.config = require('../../data/config.json')[browser.params.testEnv]
}

defineSupportCode(function ({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
})
