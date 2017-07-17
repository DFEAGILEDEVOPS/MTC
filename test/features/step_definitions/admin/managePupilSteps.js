const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I am on the manage pupil page$/, function (callback) {
    managePupilPage.get()
            .then(callback)
  })
})
