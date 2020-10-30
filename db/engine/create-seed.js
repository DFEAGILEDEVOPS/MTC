#!/usr/bin/env node
'use strict'

const moment = require('moment')
const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')
const logger = require('./log.service').getLogger()
const R = require('ramda')

const seedsDir = path.join(__dirname, '..', 'seeds')

const optionDefinitions = [
  { name: 'name', alias: 'n', type: String, defaultOption: true },
  { name: 'format', alias: 'f', type: String, defaultValue: 'tsv' },
  { name: 'table', alias: 't', type: String, defaultValue: 'custom' },
  { name: 'help', alias: 'h', type: Boolean }
]

const jsMigrationTemplate = `
'use strict'
module.exports.generateSql = function () {
}
`

const createSeeder = options => {
  const version = moment().format('YYYYMMDDHHmmss')
  const seedFile = path.join(seedsDir, `${version}.${options.table.toLowerCase()}.${options.name.toLowerCase()}`)
  let seedFileName
  if (options.format && options.format.toLowerCase() === 'js') {
    seedFileName = `${seedFile}.js`
    fs.writeFileSync(seedFileName, jsMigrationTemplate)
  } else {
    seedFileName = `${seedFile}.${options.format.toLowerCase()}`
    fs.writeFileSync(seedFileName, '')
  }
  logger.info(`Created ${seedFileName}`)
}

try {
  const options = commandLineArgs(optionDefinitions)
  if (options.help || !options.name || (options.format === 'tsv' && options.table === 'custom')) {
    logger.info(`
    Usage: create-seed.js <name> [--table <model|custom>] [--format <tsv|sql|js>] [--help]
    `)
    process.exit(0)
  }
  createSeeder(options)
  process.exit(0)
} catch (error) {
  logger.error(`Error: ${error.message}`)
  process.exit(1)
}

async function generateMultipleInsertStatements (table, data) {
  if (!Array.isArray(data)) throw new Error('Insert data is not an array')
  const paramsWithTypes = await generateParams(table, R.head(data))
  const headers = extractColumns(R.head(data))
  const values = createMultipleParamIdentifiers(data).join('), (')
  let params = []
  data.forEach((datum, idx) => {
    params.push(
      R.map((key) => {
        const sameParamWithType = paramsWithTypes.find(({ name }) => name === key)
        return {
          ...sameParamWithType,
          name: `${key.toString()}${idx}`,
          value: (sameParamWithType.type.type === 'DATETIMEOFFSETN' ? moment(datum[key]) : datum[key])
        }
      }, R.keys(datum))
    )
  })
  params = R.flatten(params)
  if (config.Logging.DebugVerbosity > 2) {
    logger.debug('sql.service: Params ', R.compose(R.map(R.pick(['name', 'value'])))(params))
  }
  const sql = `
  INSERT INTO ${sqlService.adminSchema}.${table} ( ${headers} ) VALUES ( ${values} );
  SELECT SCOPE_IDENTITY()`
  return {
    sql,
    params
  }
}

/**
 * Return a list of parameters given a table and an object whose keys are column names
 * @param {string} tableName
 * @param {object} data - keys should be col. names
 * @return {Promise<Array>}
 */
async function generateParams (tableName, data) {
  const pairs = R.toPairs(data)
  const params = []
  for (const p of pairs) {
    const [column, value] = p
    const cacheData = await sqlService.getCacheEntryForColumn(tableName, column)
    if (!cacheData) {
      throw new Error(`Column '${column}' not found in table '${tableName}'`)
    }
    const options = {}
    // Construct the options array for params generated used `create()` or `update()`
    if (cacheData.dataType === 'Decimal' || cacheData.dataType === 'Numeric') {
      options.precision = cacheData.precision
      options.scale = cacheData.scale
    } else if (cacheData.maxLength) {
      options.length = cacheData.maxLength
    }

    // logger.debug(`sql.service: generateParams: options set for [${column}]`, options)
    params.push({
      name: column,
      value,
      type: R.prop(findDataType(cacheData.dataType), sqlService.TYPES),
      options
    })
  }
  return params
}
