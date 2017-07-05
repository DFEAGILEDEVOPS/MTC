var {defineSupportCode} = require('cucumber');

defineSupportCode(function ({Given, When, Then}) {

    Given(/^I am on the manage pupil page$/, function (callback) {
        manage_pupil_page.get()
            .then(callback)
    });
});