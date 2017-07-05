var {defineSupportCode} = require('cucumber');

defineSupportCode(function ({Given, When, Then}) {
    Given(/^I am on the add pupil page$/, function (callback) {
        callback.pending();
    });

    Then(/^the pupil details should be stored$/, function (callback) {
        callback.pending();
    });

    When(/^I have submitted valid pupil details$/, function (callback) {
        callback.pending();
    });
});
