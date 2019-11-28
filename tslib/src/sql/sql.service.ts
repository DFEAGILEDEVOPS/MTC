import { Request, TYPES, ConnectionPool, Transaction } from 'mssql'
import { ILogger, ConsoleLogger } from '../common/logger'
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
  // pool can still be connecting when first used...
  // https://github.com/tediousjs/node-mssql/issues/934
  static async getInstance (): Promise<ConnectionPool> {

    // tslint:disable-next-line: strict-type-predicates
    if (this.pool === undefined) {
      this.pool = new ConnectionPool(config.Sql)
      await this.pool.connect()
      this.pool.on('error', (error) => {
        console.error(`Sql Connection Pool Error Raised:${error.message}`)
      })
    }

    if (this.pool.connected === true) {
      return this.pool
    }

    if (this.pool.connecting === false && this.pool.connected === false) {
      // may have been closed, reconnect....
      await this.pool.connect()
    }

    if (this.pool.connecting === true) {
      await this.waitForConnection()
    }

    if (this.pool.connected === false) {
      throw new Error('pool failed to connect after setup')
    }
    return this.pool
  }

  /**
   * @description idea taken from https://github.com/tediousjs/node-mssql/issues/934
   */
  private static async waitForConnection (): Promise<void> {
    let millisecondsPassed = 0
    const waitForConnectionPoolToBeReadyExecutor = (
      resolve: (value?: PromiseLike<undefined> | undefined) => void,
      reject: (reason?: any) => void
    ) => {
      setTimeout(() => {
        if (millisecondsPassed < 30000) {
          millisecondsPassed += 2000
          if (this.pool.connected) {
            resolve()
          } else {
            waitForConnectionPoolToBeReadyExecutor(resolve, reject)
          }
        } else {
          reject('Aborting start because the connection pool failed to initialize in the last ~30s.')
        }
      }, 2000)
    }

    // This simply waits for  30 seconds, for the pool to become connected.
    // Since this is also an async function, if this fails after 30 seconds, execution stops
    // and an error is thrown.
    await new Promise(waitForConnectionPoolToBeReadyExecutor)
  }

}

const connectionLimitReachedErrorCode = 10928

const dbLimitReached = (error: SqlServerError) => {
  // https://docs.microsoft.com/en-us/azure/sql-database/sql-database-develop-error-messages
  return error.number === connectionLimitReachedErrorCode
}

export class SqlService {

  private dateTimeService: IDateTimeService
  private logger: ILogger

  constructor (logger?: ILogger, dateTimeService?: IDateTimeService) {

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService

    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
  }

  /**
   * Closes all connections within a pool.
   * Do not use this in regular services.
   */
  async closePool (): Promise<void> {

    const pool = await ConnectionPoolService.getInstance()
    this.logger.info('closing connection pool..')
    await pool.close()
    this.logger.info('connection pool closed.')
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

  private addParamsToRequestSimple (params: Array<ISqlParameter>, request: Request) {

    if (params) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        request.input(param.name, param.type, param.value)
      }
    }
  }

  async query (sql: string, params?: Array<ISqlParameter>): Promise<any> {

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
  async modify (sql: string, params: Array<ISqlParameter>): Promise<any> {

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
   * Older version that executes in sequence.  Replaced with parallel version.
   * Modify data in SQL Server via mssql library.
   * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
   * @param {array} params - Array of parameters for SQL statement
   * @return {Promise}
   */
  async modifyWithTransaction (requests: Array<ITransactionRequest>): Promise<any> {

    const transaction = new Transaction(await ConnectionPoolService.getInstance())
    await transaction.begin()
    for (let index = 0; index < requests.length; index++) {
      const request = requests[index]
      const modify = async () => {
        const req = new Request(transaction)
        this.addParamsToRequest(request.params, req)
        return req.query(request.sql)
      }
      try {
        await retry<any>(modify, retryConfig, dbLimitReached)
      } catch (error) {
        this.logger.error(`error thrown from statement within transaction:${request.sql}`)
        this.logger.error('rolling back transaction...')
        await transaction.rollback()
        throw error
      }
    }
    await transaction.commit()
  }

  /**
   * Executes sql requests in parallel, rolls back if one fails.
   * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
   * @param {array} params - Array of parameters for SQL statement
   * @return {Promise}
   */
  async modifyWithTransactionParallel (requests: Array<ITransactionRequest>): Promise<any> {

    const transaction = new Transaction(await ConnectionPoolService.getInstance())
    const tasks = new Array<any>()
    await transaction.begin()
    for (let index = 0; index < requests.length; index++) {
      const request = requests[index]
      const modify = async () => {
        const req = new Request(transaction)
        this.addParamsToRequest(request.params, req)
        return req.query(request.sql)
      }
      tasks.push(modify)
    }
    try {
      await Promise.all(tasks)
      await transaction.commit()
    } catch (error) {
      this.logger.error(`error thrown from statement within transaction:${error.message}`)
      this.logger.error('rolling back transaction...')
      await transaction.rollback()
      throw error
    }
  }

  /**
   * Add parameters to an SQL request
   * @param {{name, value, type, precision, scale, options}[]} params - array of parameter objects
   * @param {{input}} request -  mssql request
   */
  private addParamsToRequest (params: Array<ISqlParameter>, request: Request): void {

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

export interface ISqlParameter {
  name: string
  value: any
  type: any
  precision?: number
  scale?: number
  options?: any
}

export interface ITransactionRequest {
  sql: string
  params: Array<ISqlParameter>
}
