// Page class for SignIn page
'use strict'

class SignInPage {

constructor () {
    this.heading = element(by.css('.heading-xlarge'));
    this.instructions = element(by.css('p.lede'));
    this.usernameField = element(by.css('#username'));
    this.passwordField = element(by.css('#password'));
    this.signIn = element(by.css('input[value="Sign in"]'));
    this.phase_banner = element(by.css('phase-banner'));
}

    enterCredentials(username,password) {
        this.usernameField.sendKeys(username)
        this.passwordField.sendKeys(password)
    }


    login(username,password) {
       this.enterCredentials(username,password)
        this.signIn.click();
    }
};

module.exports = new SignInPage();


