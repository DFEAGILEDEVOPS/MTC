// Step definitions


var {defineSupportCode} = require('cucumber');

defineSupportCode(function ({Given, When, Then}) {

    Given(/^I am on the sign in page$/, function (callback) {
        browser.get(config.appUrl);
        expect(sign_in.usernameField).to.eventually.be.present
            .then(callback);
    });

    Then(/^I should see a page heading$/, function (callback) {
        expect(sign_in.heading).to.eventually.have.text('Check Development Service')
            .then(callback);
    });

    Then(/^I should see instructions$/, function (callback) {
        expect(sign_in.instructions).to.eventually.have.text('Sign-in to access the Check Development Service')
            .then(callback);
    });

    Given(/^I have entered valid credentials$/, function (callback) {
        browser.get(config.appUrl);
        sign_in.login('teacher1', 'password')
        callback();
    });

    When(/^I sign in$/, function (callback) {
        sign_in.signIn.click
        callback();
    });

    Then(/^I should be taken to the school landing page$/, function (callback) {
        expect(landing_page.breadcrumb).to.eventually.have.text('School Home')
            .then(callback)
    });

    Given(/^I have entered invalid credentials$/, function (callback) {
        browser.get(config.appUrl);
        sign_in.login('teacher1', 'wrong')
        callback();
    });

    Then(/^I should be taken to the failed login page$/, function (callback) {
        expect(sign_in_failure.heading).to.eventually.have.text('Unable to confirm details')
        expect(sign_in_failure.instructions).to.eventually.have.text('The details entered do not match our records.')
            .then(callback);
    });

});
