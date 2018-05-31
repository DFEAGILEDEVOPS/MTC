const converter = require('number-to-words')
const { TYPES } = require('tedious')
const winston = require('winston')
const commandLineArgs = require('command-line-args')

const sqlService = require('../admin/services/data-access/sql.service')
const sqlPoolService = require('../admin/services/data-access/sql.pool.service')

const optionDefinitions = [
  { name: 'schoolsLength', alias: 's', type: Number }
]

const options = commandLineArgs(optionDefinitions)

async function main (options) {
  try {
    const { schoolsLength } = options
    winston.info('Generating schools...')
    const dfeNumbers = []
    for (let i = 0; i < schoolsLength; i++) {
      let estabCode = 1006 + i
      const schoolNumber = converter.toWords(6 + i)
      const exampleSchoolNumber = schoolNumber.charAt(0).toUpperCase() + schoolNumber.slice(1)
      estabCode = estabCode.toString()
      let name = `Example School ${exampleSchoolNumber}`
      const dfeNumber = 9991006 + i
      dfeNumbers.push(dfeNumber)
      const urn = 89006 + i
      const params = [
        {
          name: 'estabCode',
          value: estabCode,
          type: TYPES.NVarChar
        },
        {
          name: 'name',
          value: name,
          type: TYPES.NVarChar
        },
        {
          name: 'urn',
          value: urn,
          type: TYPES.Int
        },
        {
          name: 'dfeNumber',
          value: dfeNumber,
          type: TYPES.Int
        }
      ]
      const sql = `INSERT INTO ${sqlService.adminSchema}.school
      (leaCode, estabCode, name, urn, dfeNumber)
      VALUES (999, @estabCode, @name, @urn, @dfeNumber)`
      await sqlService.query(sql, params)
    }
    winston.info('Schools generated')
  } catch (error) {
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

main(options)
