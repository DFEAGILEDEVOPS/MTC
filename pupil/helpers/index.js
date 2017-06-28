'use strict';
const { version: appVersion } = require('../package.json');

const formatPageTitle = function (pageTitle) {
  let title = 'GOV.UK';
  if (typeof pageTitle !== 'undefined') {
    title = pageTitle + ' - ' + title;
  }
  return title;
};

module.exports = function (app) {
  if (typeof app === 'undefined') throw new Error('Please pass an app to this module!');
  app.locals.assetPath = '/';
  app.locals.bodyClasses = '';
  app.locals.formatPageTitle = formatPageTitle;
  app.locals.govukRoot = 'https://gov.uk';
  app.locals.govukTemplateAssetPath = '/govuk_template/';
  app.locals.headerClass = 'with-proposition';
  app.locals.htmlLang = 'en';
  app.locals.skipLinkMessage = null;
  app.locals.homepageUrl = '/';
  app.locals.logoLinkTitle = 'Go to the home page';
  app.locals.globalHeaderText = 'GOV.UK';
  app.locals.crownCopyrightMessage = null;
  app.locals.googleTrackingId = process.env.GOOGLE_TRACKING_ID;
  app.locals.deployVersion = appVersion;
};
