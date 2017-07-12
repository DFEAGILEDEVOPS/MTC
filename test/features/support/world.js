/* global browser */

const {defineSupportCode} = require('cucumber')

function CustomWorld () {
  this.signIn = require('../../page_objects/signInPage')
  this.landingPage = require('../../page_objects/landingPage')
  this.signInFailure = require('../../page_objects/signInFailure')
  this.config = require('../../data/config.json')[browser.params.testEnv]
}

defineSupportCode(({setWorldConstructor}) => {
  setWorldConstructor(CustomWorld)
})
