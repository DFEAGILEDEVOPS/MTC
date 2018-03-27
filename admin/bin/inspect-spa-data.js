#!/usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args')
const moment = require('moment')

const poolService = require('../services/data-access/sql.pool.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'filter', alias: 'f', type: String },
  { name: 'checkCode', alias: 'c', type: String },
  { name: 'addRelTiming', alias: 't', type: Boolean, 'description': 'add relative timings' }
]

const usage = function () {
  return console.log(`
    Usage: <script> --check <checkCode> --filter [answers|audit|config|device|inputs|pupil|questions]
    E.g. inspect-spa-data.js -c C367DCE8-150B-4FFD-A92C-74F766C42004 audit
    
    Fancy pants stuff
    -----------------
    
    * pipe into jq and search for an object in an array
    E.g. ./bin/inspect-spa-data.js -c 8AF9B1DC-4C78-4999-8A07-E4CEDBC28838 -f audit  | jq -C '.[] | select(.data.sequenceNumber==3)'
    `)
}

function addRelativeTimingsToInputs (inputs) {
  let lastTime, current
  for (let inputsByQuestion of inputs) {
    if (!inputsByQuestion) {
      continue
    }

    for (let input of inputsByQuestion) {
      if (!input.clientInputDate) {
        continue
      }

      current = moment(input.clientInputDate)
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
}

function addRelativeTimingsToAudits (audits) {
  let lastTime, current
  for (let audit of audits) {
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
  // inputs have clientInputDate
  // audits have clientTimestamp
  addRelativeTimingsToInputs(check.data.inputs)
  addRelativeTimingsToAudits(check.data.audit)
}

async function main (options) {
  if (!options.checkCode) {
    return usage()
  }
  let check
  try {
    check = await completedCheckDataService.sqlFindOneByCheckCode(options.checkCode)
    if (!check) {
      return console.log(`Check not found: ${options.checkCode}`)
    }
  } catch (error) {
    return console.log('Failed to retrieve check: ' + error.message)
  }

  if (options.addRelTiming) {
    addRelativeTimings(check)
  }

  const lens = options.filter ? check.data[options.filter] : check.data
  console.log(JSON.stringify(lens))
}

try {
  const options = commandLineArgs(optionDefinitions)
  main(options)
    .then(() => poolService.drain())
} catch (e) {
  console.log('Error: ' + e.message)
}
