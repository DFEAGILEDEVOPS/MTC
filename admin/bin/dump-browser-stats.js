#!/usr/bin/env node
'use strict'

require('dotenv').config()
const winston = require('winston')
const csv = require('fast-csv')
const chalk = require('chalk')
const fs = require('fs')
winston.level = 'info'
const moment = require('moment')
const useragent = require('useragent')
const R = require('ramda')

const dateService = require('../services/date.service')
const poolService = require('../services/data-access/sql.pool.service')
const completedCheckDataService = require('../services/data-access/completed-check.data.service')
const psUtilService = require('../services/psychometrician-util.service')

const outputFilename = 'browser-stats.csv'

function getCheckDate (check) {
  const checkStart = psUtilService.getClientTimestampFromAuditEvent('CheckStarted', check)
  let checkDate = ''

  if (checkStart && checkStart !== 'error') {
    const checkStartDate = moment(checkStart)
    checkDate = checkStartDate.isValid() ? dateService.formatUKDate(checkStartDate) : ''
  }
  return checkDate
}

function getBrowserStats (check) {
  const agent = useragent.lookup(R.path(['data', 'device', 'navigator', 'userAgent'], check))
  const checkDate = getCheckDate(check)
  const screen = R.pathOr({}, ['data', 'device', 'screen'], check)

  return [
    check.checkCode,
    checkDate,
    agent.os.toString(),
    agent.family.toString() + ' ' + [agent.major.toString(), agent.minor.toString()].join('.'),
    agent.device.toString().replace('0.0.0', '').trim(),
    R.propOr('', 'screenWidth', screen),
    R.propOr('', 'screenHeight', screen),
    R.propOr('', 'outerWidth', screen),
    R.propOr('', 'outerHeight', screen),
    R.or(R.or(R.prop('innerWith', screen), R.prop('innerWidth', screen)), ''),
    R.propOr('', 'innerHeight', screen),
    R.propOr('', 'colorDepth', screen)
  ]
}

function writeCsv (data) {
  if (!data.length) {
    return
  }
  const ws = fs.createWriteStream(outputFilename, { flags: 'a' })
  csv
    .write(data, {headers: false})
    .pipe(ws)
  ws.write('\n')
}

async function main () {
  const ws = fs.createWriteStream(outputFilename, { flags: 'w' })
  ws.write('Check Code,Date,OS,Browser,Device,Screen Width,Screen Height,Outer Width,Outer Height,Inner Width,Inner Height,Colour Depth\n')
  ws.end()
  const checkInfo = await completedCheckDataService.sqlFindMeta()
  winston.info(checkInfo)
  const batchSize = 250
  let lowCheckId = checkInfo.min // starting Check ID
  let count = 0

  while (lowCheckId <= checkInfo.max) {
    winston.info(`Fetching ${batchSize} checks for processing starting at ID ${lowCheckId}`)
    const checks = await completedCheckDataService.sqlFind(lowCheckId, batchSize)
    const batch = R.map(getBrowserStats, checks)
    writeCsv(batch)
    // checks are ordered by id
    lowCheckId = parseInt(R.last(checks).id, 10) + 1
    count += R.length(batch)
  }

  if (count > 0) {
    winston.info(chalk.green(`${count} checks processed`))
    winston.info(chalk.green(`Output written to ${outputFilename}`))
  } else {
    winston.info(chalk.yellowBright('No checks processed'))
  }
}

main()
  .then(() => {
    poolService.drain()
  })
  .catch(e => {
    console.warn(e)
    poolService.drain()
  })
