'use strict'

const R = require('ramda')
const { Request, TYPES } = require('tedious')
const winston = require('winston')
// winston.level = 'debug'

const sqlPoolService = require('./sql.pool.service')
const moment = require('moment')
let cache = {}

/** Utility functions **/

/**
 * Return the Tedious key value given a SQL Server datatype
 * E.g. 'nvarchar' => 'NVarChar'
 * To get the whole Type for a parameter you need the object stored under this key.
 * @param {string} type
 * @return {string | undefined}
 */
const findTediousDataType = (type) => Object.keys(TYPES).find(k => {
  if (type.toUpperCase() === k.toUpperCase()) { return k }
})

/**
 *  Given table and column names returns the cache key for looking up the datatype from the DB server
 *  It will remove square brackets from the table name if present.
 * @param {string} table
 * @param {string} column
 * @return {string}
 */
const cacheKey = (table, column) => table.replace('[', '').replace(']', '') + '_' + column

/**
 * Returns a function that extracts the keys from an object joins them together in a sql fragment
 * @type {Function}
 */
const extractColumns = R.compose(
  R.join(' , '),
  R.keys
)

/**
 * Prefix a string with '@'
 * @param s
 * @return {string}
 */
const paramName = (s) => '@' + s

/**
 * Return a function that takes the keys from an object joins them together into a list
 * of sql parameter identifiers.
 * @type {Function}
 */
const createParamIdentifiers = R.compose(
  R.join(' , '),
  R.map(paramName),
  R.keys
)

/**
 * Return a string for use in a SQL UPDATE statement
 * E.g. 'foo' => 'foo=@foo'
 * @param k
 */
const singleUpdate = (k) => R.join('', [k, '=', paramName(k)])

/**
 * Return a function that generates a list of UPDATE fragments for an entire object's keys (except the `id` key)
 * @type {Function}
 */
const generateSetStatements = R.compose(
  R.join(' , '),
  R.map(singleUpdate),
  R.keys
)

/**
 * Calls `toDate()` which returns the Javascript Date object wrapped by the Moment object
 * @param {Moment} v
 * @return {Date}
 */
const convertToDate = (v) => v.toDate()

/**
 * Returns a bool indicating the supplied object is a Moment object
 * @param v
 * @return {boolean}
 */
const isMoment = (v) => moment.isMoment(v)

/**
 * Given an object will convert all Moment values to Javascript Date
 * Useful for converting Data during UPDATES and INSERTS
 */
const convertMomentToJsDate = R.map(R.ifElse(
  isMoment,
  convertToDate,
  R.identity)
)

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
    const type = await sqlService.lookupDataTypeForColumn(tableName, column)
    if (!type) {
      throw new Error(`Column '${column}' not found in table '${tableName}'`)
    }
    params.push({
      name: column,
      value,
      type
    })
  }
  return params
}

function parseResults (results) {
  // omit metadata for now, can introduce if useful at later date
  const jsonArray = []
  results.forEach(row => {
    const json = {}
    // const metadata = []
    row.forEach(col => {
      if (col.metadata.colName !== 'version') {
        if (col.metadata.type.type === 'DATETIMEOFFSETN' && col.value) {
          json[col.metadata.colName] = moment(col.value)
        } else {
          json[col.metadata.colName] = col.value
        }
      }
    })
    jsonArray.push(json)
  })
  return jsonArray
}

/** SQL Service **/
const sqlService = {}

// Name of the admin database
sqlService.adminSchema = '[mtc_admin]'

  /**
 * Query data from the SQL Server Database
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise<results>}
 */
sqlService.query = (sql, params = []) => {
  return new Promise(async (resolve, reject) => {
    let con
    try {
      con = await sqlPoolService.getConnection()
    } catch (error) {
      reject(error)
      return
    }
    let results = []
    // http://tediousjs.github.io/tedious/api-request.html
    winston.debug(`sql.service: SQL: ${sql}`)
    var request = new Request(sql, function (err, rowCount) {
      con.release()
      if (err) {
        return reject(err)
      }
      const objects = parseResults(results)
      winston.debug('RESULTS', JSON.stringify(objects))
      resolve(objects)
    })

    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        // TODO support other options
        request.addParameter(param.name, param.type, param.value)
      }
    }

    request.on('row', function (cols) {
      results.push(cols)
    })
    con.execSql(request)
  })
}

 /**
 * Modify data in the SQL Server Database.
 * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise}
 */
sqlService.modify = (sql, params) => {
  return new Promise(async (resolve, reject) => {
    const con = await sqlPoolService.getConnection()
    const response = {}
    var request = new Request(sql, function (err, rowCount) {
      con.release()
      if (err) {
        return reject(err)
      }
      resolve(R.assoc('rowsModified', rowCount, response))
    })

    if (params) {
      for (let index = 0; index < params.length; index++) {
        let param = params[index]
        param = convertMomentToJsDate(param)
        // TODO add support for other options
        if (!param.type) {
          con.release()
          return reject(new Error('parameter type invalid'))
        }
        request.addParameter(param.name, param.type, param.value)
      }
    }

    // Pick up any OUTPUT
    request.on('row', function (cols) {
      const col = cols[0]
      const id = col.value
      if (id) { response.insertId = id }
    })

    con.execSql(request)
  })
}

/**
 * Find a row by numeric ID
 * Assumes all table have Int ID datatype
 * @param {string} table
 * @param {number} id
 * @return {Promise<void>}
 */
sqlService.findOneById = async (table, id) => {
  const paramId = { name: 'id', type: TYPES.Int, value: id }
  const sql = `
      SELECT *    
      FROM ${table}
      WHERE id = @id
    `
  const rows = await sqlService.query(sql, [paramId])
  return R.head(rows)
}

/**
 * Return the Tedious datatype object required for a particular table and column
 * It's okay if the table name has square brackets around it like '[pupil]'
 * @param {string} table
 * @param {string} column
 * @return {TYPE}
 */
sqlService.lookupDataTypeForColumn = async function (table, column) {
  const key = cacheKey(table, column)
  if (R.isEmpty(cache)) {
    // This will cache all data-types once on the first sql request
    await this.updateDataTypeCache()
  }
  if (!cache.hasOwnProperty(key)) {
    winston.debug(`sql.service: cache miss for ${key}`)
    return undefined
  }
  winston.debug(`sql.service: cache hit for ${key}`)
  return R.prop(R.prop(key, cache), TYPES)
}

/**
 * Provide the INSERT statement for passing to modify and parameters given a kay/value object
 * @param {string} table
 * @param {object} data
 * @return {{sql: string, params}}
 */
sqlService.generateInsertStatement = async (table, data) => {
  const params = await generateParams(table, data)
  winston.debug('sql.service: Params ', R.compose(R.map(R.pick(['name', 'value'])))(params))
  const sql = `
  INSERT INTO ${table} ( ${extractColumns(data)} ) VALUES ( ${createParamIdentifiers(data)} );
  SELECT @@IDENTITY`

  winston.debug('sql.service: SQL ', sql)
  return { sql, params }
}

/**
 * Utility function for internal sqlService use.  Generate the SQL UPDATE statement and list of parameters
 * given the table name and the object containing key/values to be updated.
 * @param table
 * @param data
 * @return {Promise<{sql, params: Array}>}
 */
sqlService.generateUpdateStatement = async (table, data) => {
  const params = await generateParams(table, data)
  const sql = R.join(' ', [
    'UPDATE',
    table,
    'SET ',
    generateSetStatements(R.omit(['id'], data)),
    'WHERE id=@id'
  ])
  winston.debug('sql.service: SQL ', sql)
  return { sql, params }
}

/**
 * Create a new record
 * @param {string} tableName
 * @param {object} data
 * @return {Promise} - returns the number of rows modified (e.g. 1)
 */
sqlService.create = async (tableName, data) => {
  const preparedData = convertMomentToJsDate(data)
  const { sql, params } = await sqlService.generateInsertStatement(tableName, preparedData)
  try {
    const res = await sqlService.modify(sql, params)
    winston.debug('sql.service: INSERT RESULT: ', res)
    return res
  } catch (error) {
    winston.warn('sql.service: Failed to INSERT', error)
    throw error
  }
}

/**
 * Fetch the data-types for each column in the schema.  Populates the cache.
 * @return {Promise<void>}
 */
sqlService.updateDataTypeCache = async function () {
  const sql =
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE   
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema
    `
  const paramSchema = { name: 'schema', value: 'mtc_admin', type: TYPES.NVarChar }
  // delete any existing cache
  cache = {}
  const rows = await sqlService.query(sql, [paramSchema])
  rows.forEach((row) => {
    const table = row.TABLE_NAME
    const column = row.COLUMN_NAME
    const type = row.DATA_TYPE
    const key = cacheKey(table, column)
    // add the datatype to the cache
    cache[key] = findTediousDataType(type)
  })
  winston.debug('sql.service: updateDataTypeCache() complete')
}

/**
 * Call SQL Update on the table given an object whose keys are the columns to be updated and whose keys are the new
 * values. You *MUST* pass the `id` field for the WHERE clause.
 * Returns { rowsModified: n } the number of rows modified.
 * @param tableName
 * @param data
 * @return {Promise<*>}
 */
sqlService.update = async function (tableName, data) {
  if (!data.id) {
    throw new Error('`id` is required')
  }
  // Convert any moment objects to JS Date objects as that's required by Tedious
  const preparedData = convertMomentToJsDate(data)
  const { sql, params } = await sqlService.generateUpdateStatement(tableName, preparedData)
  try {
    const res = await sqlService.modify(sql, params)
    winston.debug('sql.service: UPDATE RESULT: ', res)
    return res
  } catch (error) {
    winston.warn('sql.service: Failed to UPDATE', error)
    throw error
  }
}

module.exports = sqlService
