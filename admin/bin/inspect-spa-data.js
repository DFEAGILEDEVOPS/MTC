#!/usr/bin/env node
'use strict'

const util = require('util')

const poolService = require('../services/data-access/sql.pool.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')

let usage = function () {
  return console.log(`
    Usage: <script> checkCode [answers|audit|config|inputs|pupil|questions]
    E.g. inspect-spa-data.js C367DCE8-150B-4FFD-A92C-74F766C42004 audit
    
    Fancy pants stuff
    -----------------
    
    * output in json, pipe into jq and search for an object in an array
    E.g. ./bin/inspect-spa-data.js 8AF9B1DC-4C78-4999-8A07-E4CEDBC28838 audit --json | jq -C '.[] | select(.data.sequenceNumber==3)'
    `)
}

async function main (checkCode, filter, asJson) {
  if (!checkCode) {
    return usage()
  }
  const check = await completedCheckDataService.sqlFindOneByCheckCode(checkCode)
  if (!check) {
    return console.log('not found')
  }
  const lens = filter ? check.data[filter] : check.data
  if (asJson) {
    console.log(JSON.stringify(lens))
  } else {
    console.log(util.inspect(lens, {showHidden: false, depth: null}))
  }
}

try {
  const checkCode = process.argv[2]
  const filter = process.argv[3]
  const asJson = process.argv[4] === '--json'
  main(checkCode, filter, asJson)
    .then(() => poolService.drain())
} catch (e) {
  console.log('Err..' + e.message)
}
