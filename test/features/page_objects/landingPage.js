// Page class for Landing page
'use strict'

class LandingPage {

    constructor() {
        this.home = element(by.css('#content > .page-header > .breadcrumbs a'));
        this.breadcrumb = element(by.css('#content > .page-header > .breadcrumbs'));

    }

};

module.exports = new LandingPage();
