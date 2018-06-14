'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const uuid = require('uuid/v4')
const config = require('../../../config')
const randomGenerator = require('../../../lib/random-generator')
const winston = require('winston')
const path = require('path')

const chars = 'abcdefghijklmnopqrstuwvxyz0123456789'

module.exports.generateSql = function () {

  // if (true) {//config.MIGRATE_FULL_SCHOOL_DATASET === true) {
  //   try {
  //     winston.info('test1')
  //     const imports = await new Promise((resolve) => {
  //       let insertStatements = []
  //       winston.info()
  //       csv.fromPath('../../../NCATools_EduBase_20180604.txt', { delimiter: '|', headers: true, trim: true })
  //         .on('data', (data) => {
  //           winston.info('test3')
  //           const estabCode = data["DfENumber"].substr(data["LEANUMBER"].length)
  //           const randPin = randomGenerator.getRandom(8, chars)
  //           const randUrlSlug = uuid().toUpperCase()
  //           winston.info('test3')

  //           insertStatements.push(`DELETE FROM [mtc_admin].[school] WHERE dfeNumber = '${data["DfENumber"]}'`)
  //         })
  //         .on('end', () => {
  //           resolve(insertStatements.join('\n'))
  //         })
  //     })
  //   }
  // } else {
    return ''
  // }
}
