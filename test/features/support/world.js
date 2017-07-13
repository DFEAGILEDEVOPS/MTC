/* global browser */

const {defineSupportCode} = require('cucumber')

function CustomWorld ({attach, parameters}) {
  this.signIn = require('../../page_objects/admin/signInPage')
  this.landingPage = require('../../page_objects/admin/landingPage')
  this.signInFailure = require('../../page_objects/admin/signInFailure')
  this.config = require('../../data/config.json')[browser.params.testEnv]
  this.checkSignIn = require('../../page_objects/check/signInPage')
  this.attach = attach
  this.parameters = parameters
}

defineSupportCode(function ({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
})
