import { Request, TYPES, ConnectionPool } from 'mssql'
import { ILogger } from '../common/logger'
import retry from './async-retry'
import config from '../config'
import * as R from 'ramda'
import { DateTimeService, IDateTimeService } from '../common/datetime.service'

const retryConfig = {
  attempts: config.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: config.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: config.DatabaseRetry.PauseMultiplier
}

declare class SqlServerError extends Error {
  number?: number
}

/**
 * static class for serving single instance of a connection pool
 */
class ConnectionPoolService {
  private static pool: ConnectionPool
  private static initialisationLock: boolean

  static async getInstance (): Promise<ConnectionPool> {
    if (!this.initialisationLock === true) {
      this.initialisationLock = true
      this.pool = new ConnectionPool(config.Sql)
      await this.pool.connect()
    }
    return this.pool
  }
}

const connectionLimitReachedErrorCode = 10928

const dbLimitReached = (error: SqlServerError) => {
  // https://docs.microsoft.com/en-us/azure/sql-database/sql-database-develop-error-messages
  return error.number === connectionLimitReachedErrorCode
}

export class SqlService {

  private dateTimeService: IDateTimeService

  constructor (logger?: ILogger, dateTimeService?: IDateTimeService) {

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
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
    return R.map(R.pipe(R.map(this.dateTimeService.convertDateToMoment)), recordSet)
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

    const query = async () => {
      const request = new Request(await ConnectionPoolService.getInstance())
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
  async modify (sql: string, params: Array<any>): Promise<any> {

    const modify = async () => {
      const request = new Request(await ConnectionPoolService.getInstance())
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
