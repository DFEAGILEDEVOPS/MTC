'use strict'

const R = require('ramda')
const mssql = require('mssql')
const dateService = require('../date.service')
const poolConfig = require('../../config/sql.config')
const readonlyPoolConfig = require('../../config/sql.readonly.config')
const moment = require('moment')
const logger = require('../log.service').getLogger()
const retry = require('./retry-async')
const config = require('../../config')
const redisCacheService = require('./redis-cache.service')

const retryConfig = {
  attempts: config.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: config.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: config.DatabaseRetry.PauseMultiplier
}

const connectionLimitReachedErrorCode = 10928

const dbLimitReached = (error) => {
  // https://docs.microsoft.com/en-us/azure/sql-database/sql-database-develop-error-messages
  return error.number === connectionLimitReachedErrorCode
}

let cache = {}
/* @var mssql.ConnectionPool */
let pool

/**
 * @var {mssql.ConnectionPool} readonly connection pool for replica reads
 */
let readonlyPool

/** Utility functions **/

/**
 * Return the Tedious key value given a SQL Server datatype
 * E.g. 'nvarchar' => 'NVarChar'
 * To get the whole Type for a parameter you need the object stored under this key.
 * @param {string} type
 * @return {string | undefined}
 */
const findDataType = (type) => Object.keys(sqlService.TYPES).find(k => {
  // logger.debug(`findDataType('${type}'): called`)
  if (type.toUpperCase() === k.toUpperCase()) {
    return k
  }
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
 * Prefix a string with '@' and its index
 * @param idx
 * @param s
 * @return {string}
 */
const paramNameWithIdx = R.curry((idx, s) => '@' + s + idx)

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
 * Return a function that takes the keys from each object in an array and joins them
 * together into a list of sql parameter identifiers with specific IDs.
 * @type {Function}
 */
const createMultipleParamIdentifiers = (data) => data.map((d, idx) => R.compose(
  R.join(' , '),
  R.map(paramNameWithIdx(idx)),
  R.keys
)(d))

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
 * Returns a bool indicating the supplied object is a Moment object
 * @param v
 * @return {boolean}
 */
const isMoment = (v) => moment.isMoment(v)

/**
 * Given an object will convert all Moment values to Javascript Date
 * Useful for converting Data during UPDATES and INSERTS
 */
const convertMomentToJsDate = (m) => {
  if (!isMoment(m)) {
    return m
  }
  const iso = dateService.formatIso8601(m)
  return new Date(iso)
}

/**
 * Convert Date to Moment object
 * Useful for converting Data during UPDATES and INSERTS
 */
const convertDateToMoment = (d) => {
  if (
    d instanceof Date ||
    (typeof d === 'string' && moment(d, moment.ISO_8601).isValid())
  ) {
    return moment.utc(d)
  }
  return d
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

/** SQL Service **/
const sqlService = {
  // SQL type-mapping adapter.  Add new types as required.
  TYPES: {
    BigInt: mssql.BigInt,
    Bit: mssql.Bit,
    Char: mssql.Char,
    DateTimeOffset: mssql.DateTimeOffset,
    DateTime: mssql.DateTime,
    DateTime2: mssql.DateTime2,
    Decimal: mssql.Decimal,
    Float: mssql.Float,
    Int: mssql.Int,
    Numeric: mssql.Numeric,
    NVarChar: mssql.NVarChar,
    Real: mssql.Real,
    SmallInt: mssql.SmallInt,
    UniqueIdentifier: mssql.UniqueIdentifier
  }
}

// Name of the admin database
sqlService.adminSchema = '[mtc_admin]'

sqlService.initPool = async () => {
  if (pool) {
    logger.warn('The connection pool has already been initialised')
    return
  }
  pool = new mssql.ConnectionPool(poolConfig)
  pool.on('error', err => {
    logger.error('SQL Pool Error:', err)
  })
  return pool.connect()
}

sqlService.drainPool = async () => {
  await pool
  if (!pool) {
    logger.warn('The connection pool is not initialised')
    return
  }
  return pool.close()
}

sqlService.initReadonlyPool = async () => {
  if (config.Sql.AllowReadsFromReplica !== true) {
    throw new Error('Invalid Operation: Reads from Replica are disabled')
  }
  if (readonlyPool) {
    logger.warn('The read-only connection pool has already been initialised')
    return
  }
  readonlyPool = new mssql.ConnectionPool(readonlyPoolConfig)
  readonlyPool.on('error', err => {
    logger.error('SQL Read-only Pool Error:', err)
  })
  return readonlyPool.connect()
}

sqlService.drainReadonlyPool = async () => {
  await readonlyPool
  if (!readonlyPool) {
    logger.warn('The read-only connection pool is not initialised')
    return
  }
  return readonlyPool.close()
}

/**
 * Utility service to transform the results before sending to the caller
 * @type {Function}
 */
sqlService.transformResult = function (data) {
  const recordSet = R.prop('recordset', data) // returns [o1, o2,  ...]
  if (!recordSet) {
    return []
  }

  return R.map(R.pipe(
    R.omit(['version']),
    R.map(convertDateToMoment)
  ), recordSet)
}

function addParamsToRequestSimple (params, request) {
  if (params) {
    for (let index = 0; index < params.length; index++) {
      const param = params[index]
      // TODO support other options
      request.input(param.name, param.type, param.value)
    }
  }
}

/**
 * Query data from SQL Server via mssql
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @param {string} redisKey - Redis key to cache resultset against
 * @return {Promise<*>}
 */
sqlService.query = async (sql, params = [], redisKey) => {
  // logger.debug(`sql.service.query(): ${sql}`)
  // logger.debug('sql.service.query(): Params ', R.map(R.pick(['name', 'value']), params))
  await pool

  const query = async () => {
    let result = false
    if (redisKey) {
      try {
        const redisResult = await redisCacheService.get(redisKey)
        result = JSON.parse(redisResult)
      } catch (e) {}
    }
    if (!result) {
      const request = new mssql.Request(pool)
      addParamsToRequestSimple(params, request)
      result = await request.query(sql)
      if (redisKey) {
        await redisCacheService.set(redisKey, result)
      }
    }
    return sqlService.transformResult(result)
  }

  return retry(query, retryConfig, dbLimitReached)
}

/**
 * Query data from SQL Server over a readonly connection
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @param {string} redisKey - Redis key to cache resultset against
 * @returns {Promise<*>}
 */
sqlService.readonlyQuery = async (sql, params = [], redisKey) => {
  // logger.debug(`sql.service.readonlyQuery(): ${sql}`)
  // logger.debug('sql.service.readonlyQuery(): Params ', R.map(R.pick(['name', 'value']), params))
  // short circuit when replica reads disabled...
  if (config.Sql.AllowReadsFromReplica !== true) {
    return this.query(sql, params, redisKey)
  }
  await readonlyPool

  const query = async () => {
    let result = false
    if (redisKey) {
      try {
        const redisResult = await redisCacheService.get(redisKey)
        result = JSON.parse(redisResult)
      } catch (e) {}
    }
    if (!result) {
      const request = new mssql.Request(readonlyPool)
      addParamsToRequestSimple(params, request)
      result = await request.query(sql)
      if (redisKey) {
        await redisCacheService.set(redisKey, result)
      }
    }
    return sqlService.transformResult(result)
  }

  return retry(query, retryConfig, dbLimitReached)
}

/**
 * Add parameters to an SQL request
 * @param {{name, value, type, precision, scale, options}[]} params - array of parameter objects
 * @param {{input}} request -  mssql request
 */
function addParamsToRequest (params, request) {
  if (params) {
    for (let index = 0; index < params.length; index++) {
      const param = params[index]
      param.value = convertMomentToJsDate(param.value)
      if (!param.type) {
        throw new Error('parameter type invalid')
      }
      const options = {}
      if (R.pathEq(['type', 'name'], 'Decimal', param) ||
        R.pathEq(['type', 'name'], 'Numeric', param)) {
        options.precision = param.precision || 28
        options.scale = param.scale || 5
      }
      const opts = param.options ? param.options : options
      if (opts && Object.keys(opts).length) {
        // logger.debug('sql.service: addParamsToRequest(): opts to addParameter are: ', opts)
      }

      if (opts.precision) {
        request.input(param.name, param.type(opts.precision, opts.scale), param.value)
      } else if (opts.length) {
        request.input(param.name, param.type(opts.length), param.value)
      } else {
        request.input(param.name, param.type, param.value)
      }
    }
  }
}

/**
 * Modify data in SQL Server via mssql library.
 * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise}
 */
sqlService.modify = async (sql, params = []) => {
  // logger.debug('sql.service.modify(): SQL: ' + sql)
  // logger.debug('sql.service.modify(): Params ', R.map(R.pick(['name', 'value']), params))
  await pool

  const modify = async () => {
    const request = new mssql.Request(pool)
    addParamsToRequest(params, request)
    return request.query(sql)
  }

  const returnValue = {}
  const insertIds = []

  const rawResponse = await retry(modify, retryConfig, dbLimitReached)

  if (rawResponse && rawResponse.recordset) {
    for (const obj of rawResponse.recordset) {
      /* TODO remove this strict column name limitation and
        extract column value regardless of name */
      if (obj && obj.SCOPE_IDENTITY) {
        insertIds.push(obj.SCOPE_IDENTITY)
      }
    }
  }

  if (insertIds.length === 1) {
    returnValue.insertId = R.head(insertIds)
  } else if (insertIds.length > 1) {
    returnValue.insertIds = insertIds
  }

  return returnValue
}

/**
 * Find a row by numeric ID
 * Assumes all table have Int ID datatype
 * @param {string} table
 * @param {number} id
 * @return {Promise<object>}
 */
sqlService.findOneById = async (table, id) => {
  const paramId = {
    name: 'id',
    type: sqlService.TYPES.Int,
    value: id
  }
  const sql = `
      SELECT *
      FROM ${sqlService.adminSchema}.${table}
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
 * @return {Promise<>}
 *
 */
sqlService.getCacheEntryForColumn = async function (table, column) {
  const key = cacheKey(table, column)
  if (R.isEmpty(cache)) {
    // This will cache all data-types once on the first sql request
    await sqlService.updateDataTypeCache()
  }
  if (!{}.hasOwnProperty.call(cache, key)) {
    logger.debug(`sql.service: cache miss for ${key}`)
    return undefined
  }
  const cacheData = cache[key]
  logger.debug(`sql.service: cache hit for ${key}`)
  logger.debug('sql.service: cache', cacheData)
  return cacheData
}

/**
 * Provide the INSERT statement for passing to modify and parameters given a key/value object
 * @param {string} table
 * @param {object} data
 * @return {Promise<{sql: string, params: Array, outputParams: object}>}
 */
sqlService.generateInsertStatement = async (table, data) => {
  const params = await generateParams(table, data)
  // logger.debug('sql.service: Params ', R.compose(R.map(R.pick(['name', 'value'])))(params))
  const sql = `
  INSERT INTO ${sqlService.adminSchema}.${table} ( ${extractColumns(data)} ) VALUES ( ${createParamIdentifiers(data)} );
  SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY]`
  return {
    sql,
    params,
    outputParams: { SCOPE_IDENTITY: sqlService.TYPES.Int }
  }
}

/**
 * Provide the INSERT statements for passing to modify and parameters an array
 * @param {string} table
 * @param {array} data
 * @return {Promise<{sql: string, params}>}
 */
sqlService.generateMultipleInsertStatements = async (table, data) => {
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
          name: `${key}${idx}`,
          value: (sameParamWithType.type.type === 'DATETIMEOFFSETN' ? moment(datum[key]) : datum[key])
        }
      }, R.keys(datum))
    )
  })
  params = R.flatten(params)
  // logger.debug('sql.service: Params ', R.compose(R.map(R.pick(['name', 'value'])))(params))
  const sql = `
  INSERT INTO ${sqlService.adminSchema}.${table} ( ${headers} ) VALUES ( ${values} );
  SELECT SCOPE_IDENTITY()`
  return {
    sql,
    params
  }
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
    `UPDATE ${sqlService.adminSchema}.${table}`,
    'SET',
    generateSetStatements(R.omit(['id'], data)),
    'WHERE id=@id'
  ])
  return {
    sql,
    params
  }
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
    return sqlService.modify(sql, params)
  } catch (error) {
    logger.warn('sql.service: Failed to INSERT', error)
    throw error
  }
}

/**
 * Fetch the data-types for each column in the schema.  Populates the cache.
 * @return {Promise<void>}
 */
sqlService.updateDataTypeCache = async function () {
  const sql =
    `SELECT
      TABLE_NAME,
      COLUMN_NAME,
      DATA_TYPE,
      NUMERIC_PRECISION,
      NUMERIC_SCALE,
      CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @schema
    `
  const paramSchema = {
    name: 'schema',
    value: 'mtc_admin',
    type: sqlService.TYPES.NVarChar
  }
  // delete any existing cache
  cache = {}
  const rows = await sqlService.query(sql, [paramSchema])
  rows.forEach((row) => {
    const key = cacheKey(row.TABLE_NAME, row.COLUMN_NAME)
    // add the datatype to the cache
    cache[key] = {
      dataType: findDataType(row.DATA_TYPE),
      precision: row.NUMERIC_PRECISION,
      scale: row.NUMERIC_SCALE,
      maxLength: row.CHARACTER_MAXIMUM_LENGTH && row.CHARACTER_MAXIMUM_LENGTH > 0 ? row.CHARACTER_MAXIMUM_LENGTH : undefined
    }
  })
  logger.debug('sql.service: updateDataTypeCache() complete')
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
  const {
    sql,
    params
  } = await sqlService.generateUpdateStatement(tableName, preparedData)
  try {
    return sqlService.modify(sql, params)
  } catch (error) {
    logger.warn('sql.service: Failed to UPDATE', error)
    throw error
  }
}

/**
 * Helper function useful for constructing parameterised WHERE clauses
 * @param {Array} ary
 * @param {Object} type
 * @return {Promise<{params: Array, paramIdentifiers: Array}>}
 */
sqlService.buildParameterList = (ary, type) => {
  const params = []
  const paramIdentifiers = []
  for (let i = 0; i < ary.length; i++) {
    params.push({
      name: `p${i}`,
      type,
      value: ary[i]
    })
    paramIdentifiers.push(`@p${i}`)
  }
  return {
    params,
    paramIdentifiers
  }
}

sqlService.modifyWithTransaction = async (sqlStatements, params) => {
  const wrappedSQL = `
  BEGIN TRY
  BEGIN TRANSACTION
    ${sqlStatements}
 COMMIT TRANSACTION
END TRY

BEGIN CATCH
  IF (@@TRANCOUNT > 0)
   BEGIN
      ROLLBACK TRANSACTION
      PRINT 'Error detected, all changes reversed'
   END
  DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    SELECT @ErrorMessage = ERROR_MESSAGE(),
           @ErrorSeverity = ERROR_SEVERITY(),
           @ErrorState = ERROR_STATE();

    -- Use RAISERROR inside the CATCH block to return
    -- error information about the original error that
    -- caused execution to jump to the CATCH block.
    RAISERROR (@ErrorMessage, -- Message text.
               @ErrorSeverity, -- Severity.
               @ErrorState -- State.
               );
END CATCH
  `
  return sqlService.modify(wrappedSQL, params)
}
module.exports = sqlService
