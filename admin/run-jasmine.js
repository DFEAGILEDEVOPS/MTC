#!/usr/bin/env node

// setup Jasmine
const Jasmine = require('jasmine')
const jasmine = new Jasmine()
const jasmineConfig = require('./spec/back-end/support/jasmine.json')
jasmine.loadConfig(jasmineConfig)
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000

// setup console reporter
const JasmineConsoleReporter = require('jasmine-console-reporter')
const reporter = new JasmineConsoleReporter({
  colors: 1, // (0|false)|(1|true)|2
  cleanStack: 1, // (0|false)|(1|true)|2|3
  verbosity: 4, // (0|false)|1|2|(3|true)|4
  listStyle: 'indent', // "flat"|"indent"
  activity: false
})

// initialize and execute
jasmine.env.clearReporters()
jasmine.addReporter(reporter)
jasmine.execute()
