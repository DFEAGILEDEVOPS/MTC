// Before And After hooks used while feature executes

var outputDir = './reports/';
var screenshotDir = './reports/screenshots/';
var targetJson = outputDir + 'cucumber_report.json';

var JsonFormatter = require('cucumber').JsonFormatter;
var fse = require('fs-extra');
var reporter = require('cucumber-html-reporter');

var {defineSupportCode} = require('cucumber');

defineSupportCode(function ({registerHandler}) {
    registerHandler('BeforeFeatures', function () {
        var configData = require('../../data/config.json');
        sign_in = require('../page_objects/signInPage');
        landing_page = require('../page_objects/landingPage');
        sign_in_failure = require('../page_objects/signInFailure');
        manage_pupil_page = require('../page_objects/managePupilPage')
        helpers = require('../lib/helpers')
        mongo = require('../lib/mongoDbHelper')
        console.log("Launching test in environment: ", browser.params.testEnv);
        config = configData[browser.params.testEnv];
        browser.driver.manage().window().maximize();
        browser.waitForAngularEnabled(false);

    });
});

defineSupportCode(function ({setDefaultTimeout}) {
    setDefaultTimeout(10 * 60 * 1000);
});

defineSupportCode(function ({After, registerListener}) {

    var writeScreenshotToFile = function (image) {

        if (!fse.existsSync(screenshotDir)) {
            fse.mkdirSync(screenshotDir);
        }
        var date = new Date();
        var timestamp = date.getTime();
        var filename = "error_" + timestamp + ".png";
        var stream = fse.createWriteStream(screenshotDir + filename);
        stream.write(image);
        stream.end();
    };

    After(function (scenario, done) {
        browser.manage().deleteAllCookies();
        let self = this;
        if (scenario.isFailed()) {
            browser.takeScreenshot().then(function (png) {
                let decodedImage = new Buffer(png.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
                writeScreenshotToFile(decodedImage);
                self.attach(decodedImage, 'image/png');
                done();
            }, function (err) {
                done(err);
            });
        } else {
            done();
        }
    });

    var createHtmlReport = function (sourceJson) {

        var options = {
            theme: 'bootstrap',
            jsonFile: sourceJson,
            output: outputDir + 'cucumber_report.html',
            reportSuiteAsScenarios: true,
            launchReport: true
        };

        reporter.generate(options);
    };

    jsonFormatter = new JsonFormatter;
    jsonFormatter.log = function (string) {
        if (!fse.existsSync(outputDir)) {
            fse.mkdirSync(outputDir);
        }

        fse.writeFile(targetJson, string, function (err) {
            if (err) {
                console.log('Failed to save cucumber test results to json file.');
                console.log(err);
            } else {
                createHtmlReport(targetJson);
            }
        });
    };

    registerListener(jsonFormatter);
});
