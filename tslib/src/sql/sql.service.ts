import { ConnectionPool, config, IRequestParameters, Request } from 'mssql'
import { ILogger } from '../common/ILogger'
import * as retry from './async-retry'
import { default as mtcConfig } from '../config'
import { Moment } from 'moment'
import moment = require('moment')
import * as R from 'ramda'

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

  constructor (mssqlConfig: config, logger: ILogger) {
    this._mssqlConfig = mssqlConfig
    this._connectionPool = new ConnectionPool(this._mssqlConfig)
    this._logger = logger
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
 * Convert Date to Moment object
 * Useful for converting Data during UPDATES and INSERTS
 */
  convertDateToMoment (d: Date | Moment): Moment {
    if (d instanceof Date && moment(d, moment.ISO_8601).isValid()) {
      return moment.utc(d)
    }
    return d as Moment
  }

  /**
   * Utility service to transform the results before sending to the caller
   * @type {Function}
   */
  transformQueryResult (data: any) {
    const recordSet = R.prop('recordset', data) // returns [o1, o2,  ...]
    if (!recordSet) {
      return []
    }
    // return R.map(this.convertDateToMoment, recordSet)
    return R.map(R.pipe(R.map(this.convertDateToMoment)), recordSet)
    // return recordSet
  }
/*
  addParamsToRequestSimple (params: IRequestParameters, request: Request) {
    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        // TODO support other options
        request.input(param.name, param.type, param.value)
      }
    }
  } */

  async query (sql: string, params?: IRequestParameters): Promise<any> {
    // let result
    const query = async () => {
      const request = new Request(this._connectionPool)
/*       if (params !== undefined) {
        this.addParamsToRequestSimple(params, request)
      } */
      const result = await request.query(sql)
      return this.transformQueryResult(result)

    }
    return retry.default(query, retryConfig, dbLimitReached)
  }
}
