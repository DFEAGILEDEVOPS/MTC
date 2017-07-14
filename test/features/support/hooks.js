// Before And After hooks used while feature executes
/* global browser */

const outputDir = './reports/'
const screenshotDir = './reports/screenshots/'
const targetJson = outputDir + 'cucumber_report.json'
const JsonFormatter = require('cucumber').JsonFormatter
const fse = require('fs-extra')
const reporter = require('cucumber-html-reporter')
const {defineSupportCode} = require('cucumber')

defineSupportCode(function ({registerHandler}) {
  registerHandler('BeforeFeatures', function () {
    browser.driver.manage().window().maximize()
    browser.waitForAngularEnabled(false)
  })
})

defineSupportCode(function ({setDefaultTimeout}) {
  setDefaultTimeout(10 * 60 * 1000)
})

defineSupportCode(function ({After, registerListener}) {
  const writeScreenshotToFile = function (image) {
    if (!fse.existsSync(screenshotDir)) {
      fse.mkdirSync(screenshotDir)
    }
    const date = new Date()
    const timestamp = date.getTime()
    const filename = 'error_' + timestamp + '.png'
    const stream = fse.createWriteStream(screenshotDir + filename)
    stream.write(image)
    stream.end()
  }

  After(function (scenario, done) {
    browser.manage().deleteAllCookies()
    let self = this
    if (scenario.isFailed()) {
      browser.takeScreenshot().then(function (png) {
        let decodedImage = Buffer.from(png.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64')
        writeScreenshotToFile(decodedImage)
        self.attach(decodedImage, 'image/png')
        done()
      }, function (err) {
        done(err)
      })
    } else {
      done()
    }
  })

  const createHtmlReport = function (sourceJson) {
    const options = {
      theme: 'bootstrap',
      jsonFile: sourceJson,
      output: outputDir + 'cucumber_report.html',
      reportSuiteAsScenarios: true,
      launchReport: true
    }

    reporter.generate(options)
  }

  const jsonFormatter = new JsonFormatter()
  jsonFormatter.log = function (string) {
    if (!fse.existsSync(outputDir)) {
      fse.mkdirSync(outputDir)
    }

    fse.writeFile(targetJson, string, function (err) {
      if (err) {
        console.log('Failed to save cucumber test results to json file.')
        console.log(err)
      } else {
        createHtmlReport(targetJson)
      }
    })
  }

  registerListener(jsonFormatter)
})
