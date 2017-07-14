/* global browser */

const {defineSupportCode} = require('cucumber')

function CustomWorld ({attach, parameters}) {
  this.signIn = require('../../page_objects/admin/signInPage')
  this.landingPage = require('../../page_objects/admin/landingPage')
  this.signInFailure = require('../../page_objects/admin/signInFailure')
  this.config = require('../../data/config.json')[browser.params.testEnv]
  this.checkSignInPage = require('../../page_objects/check/CheckSignInPage')
  this.attach = attach
  this.parameters = parameters
  this.Mongo = require('../../lib/mongoDbHelper')
}

defineSupportCode(function ({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
})
