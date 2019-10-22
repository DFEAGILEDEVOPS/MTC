import { ConnectionPool, config, Request, TYPES } from 'mssql'
import { ILogger } from '../common/ILogger'
import retry from './async-retry'
import { default as mtcConfig } from '../config'
import * as R from 'ramda'
import { DateTimeService, IDateTimeService } from '../common/DateTimeService'

const retryConfig = {
  attempts: mtcConfig.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: mtcConfig.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: mtcConfig.DatabaseRetry.PauseMultiplier
}

declare class SqlServerError extends Error {
  number?: number
}

const connectionLimitReachedErrorCode = 10928

const dbLimitReached = (error: SqlServerError) => {
  // https://docs.microsoft.com/en-us/azure/sql-database/sql-database-develop-error-messages
  return error.number === connectionLimitReachedErrorCode
}

export class SqlService {

  private _connectionPool: ConnectionPool
  private _mssqlConfig: config
  private _logger: ILogger
  private _dateTimeService: IDateTimeService

  constructor (mssqlConfig: config, logger: ILogger, dateTimeService?: IDateTimeService) {
    this._mssqlConfig = mssqlConfig
    this._connectionPool = new ConnectionPool(this._mssqlConfig)
    this._logger = logger

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this._dateTimeService = dateTimeService
  }

  async init (): Promise<void> {
    try {
      await this._connectionPool.connect()
    } catch (error) {
      this._logger.error('Pool Connection Error:', error)
      throw error
    }
    this._connectionPool.on('error', (error: Error) => {
      this._logger.error('SQL Pool Error:', error)
    })
  }

  close (): Promise<void> {
    if (!this._connectionPool) {
      this._logger.warn('The connection pool is not initialised')
      return Promise.resolve()
    }
    return this._connectionPool.close()
  }

  /**
   * Utility service to transform the results before sending to the caller
   * @type {Function}
   */
  private transformQueryResult (data: any) {
    const recordSet = R.prop('recordset', data) // returns [o1, o2,  ...]
    if (!recordSet) {
      return []
    }
    // TODO remove version property using R.omit()
    /*
    return R.map(R.pipe(
    R.omit(['version']),
    R.map(convertDateToMoment)
  ), recordSet)
    */
    return R.map(R.pipe(R.map(this._dateTimeService.convertDateToMoment)), recordSet)
  }

  private addParamsToRequestSimple (params: Array<any>, request: Request) {
    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        request.input(param.name, param.type, param.value)
      }
    }
  }

  async query (sql: string, params?: Array<any>): Promise<any> {
    // logger.debug(`sql.service.query(): ${sql}`)
    // logger.debug('sql.service.query(): Params ', R.map(R.pick(['name', 'value']), params))
    // tslint:disable-next-line: await-promise
    await this._connectionPool

    const query = async () => {
      const request = new Request(this._connectionPool)
      if (params !== undefined) {
        this.addParamsToRequestSimple(params, request)
      }
      const result = await request.query(sql)
      return this.transformQueryResult(result)

    }
    return retry<any>(query, retryConfig, dbLimitReached)
  }

/**
 * Modify data in SQL Server via mssql library.
 * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
 * @param {array} params - Array of parameters for SQL statement
 * @return {Promise}
 */
  async modify (sql: string, params: []) {
    // logger.debug('sql.service.modify(): SQL: ' + sql)
    // logger.debug('sql.service.modify(): Params ', R.map(R.pick(['name', 'value']), params))
    // tslint:disable-next-line: await-promise
    await this._connectionPool

    const modify = async () => {
      const request = new Request(this._connectionPool)
      this.addParamsToRequest(params, request)
      return request.query(sql)
    }

    let returnValue: any
    const insertIds = []

    const rawResponse = await retry<any>(modify, retryConfig, dbLimitReached)

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
 * Add parameters to an SQL request
 * @param {{name, value, type, precision, scale, options}[]} params - array of parameter objects
 * @param {{input}} request -  mssql request
 */
  private addParamsToRequest (params: Array<any>, request: Request): void {
    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        param.value = this._dateTimeService.convertMomentToJsDate(param.value)
        if (!param.type) {
          throw new Error('parameter type invalid')
        }
        const options: any = {}
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
 * Find a row by numeric ID
 * Assumes all table have Int ID datatype
 * @param {string} table
 * @param {number} id
 * @return {Promise<object>}
 */
  async findOneById (table: string, id: number): Promise<any> {
    const paramId = {
      name: 'id',
      type: TYPES.Int,
      value: id
    }
    const sql = `
        SELECT *
        FROM [mtc_admin].${table}
        WHERE id = @id
      `
    const rows = await this.query(sql, [paramId])
    return R.head(rows)
  }
}
