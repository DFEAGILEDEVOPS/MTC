import { Request, TYPES, Transaction, type IResult, ISOLATION_LEVEL } from 'mssql'
import { type ILogger, ConsoleLogger } from '../common/logger'
import retry, { retryOnAllSoftErrorsPredicate } from './async-retry'
import config from '../config'
import * as R from 'ramda'
import { DateTimeService, type IDateTimeService } from '../common/datetime.service'
import * as connectionPool from './pool.service'

const retryConfig = {
  attempts: config.DatabaseRetry.MaxRetryAttempts,
  pauseTimeMs: config.DatabaseRetry.InitialPauseMs,
  pauseMultiplier: config.DatabaseRetry.PauseMultiplier
}
export interface IModifyResult {
  insertId?: number
  insertIds?: number[]
}
export class SqlService implements ISqlService {
  private readonly dateTimeService: IDateTimeService
  private readonly logger: ILogger

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
    const pool = await connectionPool.getInstance()
    this.logger.info('closing connection pool..')
    await pool.close()
    this.logger.info('connection pool closed.')
  }

  /**
   * Utility service to transform the results before sending to the caller
   * @type {Function}
   */
  private transformQueryResult (data: any): unknown {
    const recordSet = R.prop('recordset', data) // returns [o1, o2,  ...]
    if (recordSet === undefined) {
      return []
    }
    return R.map(R.pipe(R.map(this.dateTimeService.convertDateToMoment)), recordSet)
  }

  private addParamsToRequestSimple (params: ISqlParameter[], request: Request): void {
    if (params !== undefined) {
      for (let index = 0; index < params.length; index++) {
        const param = params[index]
        request.input(param.name, param.type, param.value)
      }
    }
  }

  async query (sql: string, params?: ISqlParameter[]): Promise<any> {
    if (config.Logging.DebugVerbosity > 1) {
      this.logger.verbose(`sql.service.query(): ${sql}`)
    }
    const query = async (): Promise<any> => {
      const request = new Request(await connectionPool.getInstance())
      if (params !== undefined) {
        this.addParamsToRequestSimple(params, request)
      }
      const result = await request.query(sql)
      return this.transformQueryResult(result)
    }
    return retry<any>(query, retryConfig, retryOnAllSoftErrorsPredicate)
  }

  /**
   * Modify data in SQL Server via mssql library.
   * @param {string} sql - The INSERT/UPDATE/DELETE statement to execute
   * @param {array} params - Array of parameters for SQL statement
   * @return {Promise}
   */
  async modify (sql: string, params: ISqlParameter[]): Promise<IModifyResult> {
    if (config.Logging.DebugVerbosity > 1) {
      this.logger.verbose(`sql.service.modify(): ${sql}`)
    }
    const modify = async (): Promise<IResult<any>> => {
      const request = new Request(await connectionPool.getInstance())
      this.addParamsToRequest(params, request)
      return request.query(sql)
    }

    const returnValue: IModifyResult = {
      insertId: undefined,
      insertIds: undefined
    }
    const insertIds = []

    const rawResponse = await retry<any>(modify, retryConfig, retryOnAllSoftErrorsPredicate)

    if (rawResponse?.recordset !== undefined) {
      for (const obj of rawResponse.recordset) {
        /* TODO remove this strict column name limitation and
          extract column value regardless of name */
        insertIds.push(obj.SCOPE_IDENTITY)
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
  async modifyWithTransaction (requests: ITransactionRequest[]): Promise<any> {
    const transaction = new Transaction(await connectionPool.getInstance())
    await transaction.begin(ISOLATION_LEVEL.SERIALIZABLE)
    for (let index = 0; index < requests.length; index++) {
      const request = requests[index]
      const modify = async (): Promise<IResult<any>> => {
        const req = new Request(transaction)
        this.addParamsToRequest(request.params, req)
        return req.query(request.sql)
      }
      try {
        await retry<any>(modify, retryConfig, retryOnAllSoftErrorsPredicate)
      } catch (error) {
        const sqlSnippet = request.sql.slice(0, 999) + '...'
        this.logger.error(`error thrown from statement within transaction:${sqlSnippet}`)
        this.logger.error('rolling back transaction...')
        await transaction.rollback()
        throw error
      }
    }
    await transaction.commit()
  }

  /**
   * Add parameters to an SQL request
   * @param {{name, value, type, precision, scale, options}[]} params - array of parameter objects
   * @param {{input}} request -  mssql request
   */
  private addParamsToRequest (params: ISqlParameter[], request: Request): void {
    for (let index = 0; index < params.length; index++) {
      const param = params[index]
      if (param.type === undefined) {
        throw new Error('parameter type invalid')
      }
      const options: any = {}
      if (R.pathEq(['type', 'name'], 'Decimal', param) ||
        R.pathEq(['type', 'name'], 'Numeric', param)) {
        options.precision = param.precision ?? 28
        options.scale = param.scale ?? 5
      }
      const opts = param.options !== undefined ? param.options : options
      if (opts !== undefined && Object.keys(opts).length > 0) {
        // logger.debug('sql.service: addParamsToRequest(): opts to addParameter are: ', opts)
      }

      if (opts.precision !== undefined) {
        request.input(param.name, param.type(opts.precision, opts.scale), param.value)
      } else if (opts.length !== undefined) {
        request.input(param.name, param.type(opts.length), param.value)
      } else {
        request.input(param.name, param.type, param.value)
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
  params: ISqlParameter[]
}

export interface ISqlService {
  query (sql: string, params?: ISqlParameter[]): Promise<any>
  modify (sql: string, params: ISqlParameter[]): Promise<IModifyResult>
  modifyWithTransaction (requests: ITransactionRequest[]): Promise<any>
}
