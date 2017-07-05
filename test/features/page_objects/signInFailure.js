// Page class for SignIn Failure page
'use strict'

class SignInFailurePage {

    constructor() {

        this.heading = element(by.css('.heading-xlarge'));
        this.instructions = element(by.css('p.lede'));
        this.phase_banner = element(by.css('phase-banner'));
    }
}
;

module.exports = new SignInFailurePage();
