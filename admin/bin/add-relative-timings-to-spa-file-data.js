#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args')
const moment = require('moment')
const fs = require('fs-extra')

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'filter', alias: 'r', type: String },
  { name: 'file', alias: 'f', type: String },
  { name: 'addRelTiming', alias: 't', type: Boolean, description: 'add relative timings' }
]

const usage = function () {
  return console.log(`
    Usage: <script> --file file [--verbose] [-v] [--filter [answers|audit|config|device|inputs|pupil|questions]]
    E.g. inspect-spa-data.js -f spa-data.json audit

    Fancy pants stuff
    -----------------

    * pipe into jq and search for an object in an array
    E.g. ./bin/inspect-spa-data.js <file> -f audit  | jq -C '.[] | select(.data.sequenceNumber==3)'
    `)
}

function addRelativeTimingsToInputs (inputs) {
  let lastTime, current
  for (const input of inputs) {
    if (!input) {
      continue
    }

    if (!input.clientTimestamp) {
      continue
    }

    current = moment(input.clientTimestamp)

    if (lastTime) {
      const secondsDiff = (
        current.valueOf() - lastTime.valueOf()
      ) / 1000
      const signAsNumber = Math.sign(secondsDiff)
      let sign = ''
      switch (signAsNumber) {
        case 1:
        case 0:
          sign = '+'
          break
        case -1:
        case -0:
          sign = '-'
      }
      input.relativeTiming = '' + sign + Math.abs(secondsDiff)
    } else {
      input.relativeTiming = '+0.00'
    }
    lastTime = current
  }
}

function addRelativeTimingsToAudits (audits) {
  let lastTime, current
  for (const audit of audits) {
    if (!audit.clientTimestamp) {
      continue
    }
    current = moment(audit.clientTimestamp)
    if (lastTime) {
      const secondsDiff = (
        current.valueOf() - lastTime.valueOf()
      ) / 1000
      const signAsNumber = Math.sign(secondsDiff)
      let sign = ''
      switch (signAsNumber) {
        case 1:
        case 0:
          sign = '+'
          break
        case -1:
        case -0:
          sign = '-'
      }
      audit.relativeTiming = '' + sign + Math.abs(secondsDiff)
    } else {
      audit.relativeTiming = '+0.00'
    }
    lastTime = current
  }
}

function addRelativeTimings (check) {
  // Add relative timings to all objects with clientTimestamps
  // inputs have clientTimestamp
  // audits have clientTimestamp
  addRelativeTimingsToInputs(check.inputs)
  addRelativeTimingsToAudits(check.audit)
}

async function main (options) {
  if (!options.file) {
    process.exitCode = 1
    return usage()
  }
  const check = await fs.readJSON(options.file)

  if (!check) {
    process.exitCode = 1
    return usage()
  }

  addRelativeTimings(check)

  const lens = options.filter ? check[options.filter] : check
  console.log(JSON.stringify(lens))
}

const options = commandLineArgs(optionDefinitions)
main(options)
  .then(() => {
    // do nothing
  })
  .catch(err => console.error(err))
