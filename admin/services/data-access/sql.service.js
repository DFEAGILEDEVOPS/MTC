'use strict'

const R = require('ramda')
const mssql = require('mssql')
const dateService = require('../date.service')
const moment = require('moment')
const logger = require('../log.service').getLogger()
const {
  asyncRetryHandler,
  sqlAzureTimeoutRetryPredicate,
  sqlAzureResourceLimitReachedPredicate,
  sqlAzureRequestTimeoutRetryPredicate,
  socketErrorPredicate
} = require('./retry-async')
const config = require('../../config')
const redisCacheService = require('./redis-cache.service')
const poolService = require('./sql.pool.service')
const roles = require('../../lib/consts/roles')

const retryConfig = {
  attempts: config.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: config.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: config.DatabaseRetry.PauseMultiplier
}

// Retry only on these errors
const combinedTimeoutAndResourceLimitsReachedPredicate = (error) => {
  return sqlAzureResourceLimitReachedPredicate(error) ||
    sqlAzureTimeoutRetryPredicate(error) ||
    sqlAzureRequestTimeoutRetryPredicate(error) ||
    socketErrorPredicate(error)
}

let cache = {}

/** Utility functions **/

/**
 * Return the Tedious key value given a SQL Server datatype
 * E.g. 'nvarchar' => 'NVarChar'
 * To get the whole Type for a parameter you need the object stored under this key.
 * @param {string} type
 * @return {any}
 */
const findDataType = (type) => Object.keys(sqlService.TYPES).find(k => {
  // logger.debug(`findDataType('${type}'): called`)
  if (type.toUpperCase() === k.toUpperCase()) {
    return true
  }
  return false
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
 * @param {number} idx
 * @param {string} s
 * @return {function(): string}
 */
const paramNameWithIdx = R.curry((idx, s) => '@' + s + idx)

/**
 * Return a function that takes the keys from an object joins them together into a list
 * of sql parameter identifiers.
 * @return {function()}
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
  // @ts-ignore
  R.map(paramNameWithIdx(idx)),
  R.keys
// @ts-ignore
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
  if (d instanceof Date) {
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

function addParamsToRequestSimple (params, request) {
  if (params) {
    for (const param of params) {
      // TODO support other options
      request.input(param.name, param.type, param.value)
    }
  }
}

/**
 * Add parameters to an SQL request
 * @param {{name, value, type, precision, scale, options}[]} params - array of parameter objects
 * @param {{input}} request -  mssql request
 */
function addParamsToRequest (params, request) {
  if (params) {
    for (const param of params) {
      param.value = convertMomentToJsDate(param.value)
      if (!param.type) {
        throw new Error('parameter type invalid')
      }
      const options = {}
      if (R.pathEq('Decimal', ['type', 'name'], param) ||
        R.pathEq('Numeric', ['type', 'name'], param)) {
        options.precision = param.precision || 28
        options.scale = param.scale || 5
      }
      const opts = param.options ? param.options : options
      if (config.Logging.DebugVerbosity > 1 && opts && Object.keys(opts).length) {
        logger.debug('sql.service: addParamsToRequest(): opts to addParameter are: ', opts)
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
    UniqueIdentifier: mssql.UniqueIdentifier,
    MAX: mssql.MAX
  },
  adminSchema: '[mtc_admin]',
  initPool: async function initPool () {
    const pool = poolService.createPool(roles.teacher)
    pool.on('error', err => {
      logger.error('SQL Pool Error:', err)
    })
    return pool.connect()
  },
  drainPool: async function drainPool () {
    return poolService.closePool(roles.teacher)
  },
  initReadonlyPool: function initReadonlyPool () {
    if (config.Sql.AllowReadsFromReplica !== true) {
      throw new Error('Invalid Operation: Reads from Replica are disabled')
    }
    const readonlyPool = poolService.createPool(roles.teacher, true)
    readonlyPool.on('error', err => {
      logger.error('SQL Read-only Pool Error:', err)
    })
    return readonlyPool.connect()
  },
  drainReadonlyPool: async function drainReadonlyPool () {
    return poolService.closePool(roles.teacher, true)
  },
  /**
 * Utility service to transform the results before sending to the caller
 * @type {Function}
 */
  transformResult: function transformResult (data) {
    const recordSet = R.prop('recordset', data) // returns [o1, o2,  ...]
    if (!recordSet) {
      return []
    }

    return R.map(R.pipe(
      R.omit(['version']),
      R.map(convertDateToMoment)
    ), recordSet)
  },
  /**
 * Query data from SQL Server via mssql
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @param {string} redisKey - Redis key to cache resultset against
 * @param {string} userRole - optional. obtain a connection for a specific user role
 * @return {Promise<Object[]>}
 */
  query: async function query (sql, params = [], redisKey = undefined, userRole = roles.teacher) {
    if (config.Logging.DebugVerbosity > 1) {
      logger.debug(`sql.service.query(): ${sql}`)
      logger.debug('sql.service.query(): Params ', R.map(R.pick(['name', 'value']), params))
    }
    const createPoolIfItDoesNotExist = true
    const pool = await poolService.getPool(userRole, createPoolIfItDoesNotExist)
    if (!pool.connected && !pool.connecting) {
      await pool.connect()
    }
    const query = async () => {
      let result = false
      if (redisKey) {
        try {
          const redisResult = await redisCacheService.get(redisKey)
          result = JSON.parse(redisResult)
        } catch {
          // do nothing
        }
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
    return asyncRetryHandler(query, retryConfig, combinedTimeoutAndResourceLimitsReachedPredicate)
  },
  /**
 * Query data from SQL Server over a readonly connection
 * @param {string} sql - The SELECT statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @param {string} redisKey - Redis key to cache resultset against
 * @param {string} roleName - optional. obtain a connection for a specific user role
 * @returns {Promise<*>}
 */
  readonlyQuery: async function readonlyQuery (sql, params = [], redisKey = '', roleName = roles.teacher) {
    if (config.Logging.DebugVerbosity > 1) {
      logger.debug(`sql.service.readonlyQuery(): ${sql}`)
      logger.debug('sql.service.readonlyQuery(): Params ', R.map(R.pick(['name', 'value']), params))
    }

    // short circuit when replica reads disabled...
    if (config.Sql.AllowReadsFromReplica !== true) {
      return sqlService.query(sql, params, redisKey)
    }

    const readonlyPool = await poolService.getPool(roleName, true)

    const query = async () => {
      let result = false
      if (redisKey) {
        try {
          const redisResult = await redisCacheService.get(redisKey)
          result = JSON.parse(redisResult)
        } catch {
          // do nothing
        }
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
    return asyncRetryHandler(query, retryConfig, combinedTimeoutAndResourceLimitsReachedPredicate)
  },
  /**
 * Modify data in SQL Server via mssql library.
 * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @param {string} roleName - optional. obtain a connection for a specific user role
 * @return {Promise}
 */
  modify: async function modify (sql, params = [], roleName = roles.teacher) {
    if (config.Logging.DebugVerbosity > 1) {
      logger.debug('sql.service.modify(): SQL: ' + sql)
      logger.debug('sql.service.modify(): Params ', R.map(R.pick(['name', 'value']), params))
    }

    const pool = await poolService.getPool(roleName)

    const modify = async () => {
      const request = new mssql.Request(pool)
      addParamsToRequest(params, request)
      return request.query(sql)
    }

    const returnValue = {}
    const insertIds = []

    const rawResponse = await asyncRetryHandler(modify, retryConfig,
      combinedTimeoutAndResourceLimitsReachedPredicate)

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
  },
  /**
 * Return the response from the query
 * @param {String} sql
 * @param {Array} params
 * @param {string} roleName - optional. obtain a connection for a specific user role
 * @return {Promise<{response?: Array}>}
 */
  modifyWithResponse: async function modifyWithResponse (sql, params = [], roleName = roles.teacher) {
    const pool = await poolService.getPool(roleName)

    const modify = async () => {
      const request = new mssql.Request(pool)
      addParamsToRequest(params, request)
      return request.query(sql)
    }

    const rawResponse = await asyncRetryHandler(modify, retryConfig,
      combinedTimeoutAndResourceLimitsReachedPredicate)

    const returnValue = {}

    if (rawResponse.recordset) {
      returnValue.response = rawResponse.recordset
    }
    return returnValue
  },
  /**
 * Find a row by numeric ID
 * Assumes all table have Int ID datatype
 * @param {string} table
 * @param {number} id
 * @return {Promise<object>}
 */
  findOneById: async function findOneById (table, id) {
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
  },
  /**
 * Return the Tedious datatype object required for a particular table and column
 * It's okay if the table name has square brackets around it like '[pupil]'
 * @param {string} table
 * @param {string} column
 * @return {Promise<>}
 *
 */
  getCacheEntryForColumn: async function getCacheEntryForColumn (table, column) {
    const key = cacheKey(table, column)
    if (R.isEmpty(cache)) {
      // This will cache all data-types once on the first sql request
      await sqlService.updateDataTypeCache()
    }
    if (!{}.hasOwnProperty.call(cache, key)) {
      if (config.Logging.DebugVerbosity > 2) {
        logger.debug(`sql.service: cache miss for ${key}`)
      }
      return undefined
    }
    const cacheData = cache[key]

    if (config.Logging.DebugVerbosity > 2) {
      logger.debug(`sql.service: cache hit for ${key}`)
      logger.debug('sql.service: cache', cacheData)
    }
    return cacheData
  },
  /**
   * Provide the INSERT statement for passing to modify and parameters given a key/value object
   * @param {string} table
   * @param {object} data
   * @return {Promise<{sql: string, params: Array, outputParams: object}>}
   */
  generateInsertStatement: async function generateInsertStatement (table, data) {
    const params = await generateParams(table, data)
    if (config.Logging.DebugVerbosity > 2) {
      logger.debug('sql.service: Params ', R.compose(R.map(R.pick(['name', 'value'])))(params))
    }
    const sql = `
    INSERT INTO ${sqlService.adminSchema}.${table} ( ${extractColumns(data)} ) VALUES ( ${createParamIdentifiers(data)} );
    SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY]`
    return {
      sql,
      params,
      outputParams: { SCOPE_IDENTITY: sqlService.TYPES.Int }
    }
  },
  /**
 * Provide the INSERT statements for passing to modify and parameters an array
 * @param {string} table
 * @param {array} data
 * @return {Promise<{sql: string, params}>}
 */
  generateMultipleInsertStatements: async function generateMultipleInsertStatements (table, data) {
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
  },
  /**
 * Utility function for internal sqlService use.  Generate the SQL UPDATE statement and list of parameters
 * given the table name and the object containing key/values to be updated.
 * @param table
 * @param data
 * @return {Promise<{sql, params: Array}>}
 */
  generateUpdateStatement: async function generateUpdateStatement (table, data) {
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
  },
  /**
 * Operation Result
 * @typedef {Object} SqlOperationResult
 * @property {number | undefined} insertId - the primary key value of the newly inserted record
 * @property {number | undefined} rowsModified - the number of rows modified by an update
 */

  /**
 * Create a new record
 * @param {string} tableName
 * @param {object} data
 * @return {Promise<SqlOperationResult>} - returns the number of rows modified (e.g. 1)
 */
  create: async function create (tableName, data) {
    const preparedData = convertMomentToJsDate(data)
    const { sql, params } = await sqlService.generateInsertStatement(tableName, preparedData)
    try {
      return sqlService.modify(sql, params)
    } catch (error) {
      logger.warn('sql.service: Failed to INSERT', error)
      throw error
    }
  },
  /**
   * Fetch the data-types for each column in the schema.  Populates the cache.
   * @return {Promise<void>}
   */
  updateDataTypeCache: async function updateDataTypeCache () {
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
  },
  /**
   * Call SQL Update on the table given an object whose keys are the columns to be updated and whose keys are the new
   * values. You *MUST* pass the `id` field for the WHERE clause.
   * Returns { rowsModified: n } the number of rows modified.
   * @param tableName
   * @param data
   * @return {Promise<*>}
   */
  update: async function update (tableName, data) {
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
  },
  /**
   * Helper function useful for constructing parameterised WHERE clauses
   * @param {Array} ary
   * @param {Object} type
   * @param {String} prefix
   * @param {Number} index
   * @return {{paramIdentifiers: *, params: *}}
   */
  buildParameterList: function buildParameterList (ary, type, prefix = 'p', index = 0) {
    const params = []
    const paramIdentifiers = []
    for (let i = 0; i < ary.length; i++) {
      const paramIndex = i + index
      params.push({
        name: `${prefix}${paramIndex}`,
        type,
        value: ary[paramIndex]
      })
      paramIdentifiers.push(`@${prefix}${paramIndex}`)
    }
    return {
      params,
      paramIdentifiers
    }
  },
  modifyWithTransaction: async function modifyWithTransaction (sqlStatements, params) {
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
  },
  /**
   * Return the response from the query
   * @param {String[]} sqlStatements statements
   * @param {Array} params
   * @return {Promise<{response?: Array}>}
   */
  modifyWithTransactionAndResponse: async function modifyWithTransactionAndResponse (sqlStatements, params) {
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
    return sqlService.modifyWithResponse(wrappedSQL, params)
  }
}

module.exports = sqlService
