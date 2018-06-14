'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const config = require('../../../config')
const randomGenerator = require('../../../lib/random-generator')
const winston = require('winston')
const path = require('path')

const chars = 'abcdefghijklmnopqrstuwvxyz0123456789'

const parseFile = () => {
  const jsonFile = require('../../../NCATools_EduBase_20180604.json')

  let insertStatements = []
  jsonFile.forEach((data) => {
    const estabCode = data["DfENumber"].substr(data["LEANUMBER"].length)
    const randPin = randomGenerator.getRandom(8, chars)
    const randUrlSlug = uuid().toUpperCase()
    const schoolName = data["NAME"].replace("'", "''")

    if (data["LEANUMBER"] === '' || data["DfENumber"] === '')
      return

    insertStatements.push(`INSERT [mtc_admin].[school] (leaCode, estabCode, name, pin, pinExpiresAt, urlSlug, dfeNumber)
    VALUES ('${data["LEANUMBER"]}', '${estabCode}', '${schoolName}', '${randPin}', '2025-01-01 00:00:00.000', '${randUrlSlug}', '${data["DfENumber"]}');`)
  })

  return insertStatements.join('\n')
}

module.exports.generateSql = () => {

  if (true) {//config.MIGRATE_FULL_SCHOOL_DATASET === true) {
    return parseFile()
  } else {
    return ''
  }
}
