import * as R from 'ramda'
import moment from 'moment'

import { SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import config from '../../config'

const functionName = 'school-results-cache-determiner'

export interface ISchoolResultsCacheMessage {
  schoolName: string
  schoolGuid: string
}

export interface ISchoolResultsCacheDeterminerFunctionBindings {
  schoolResultsCache: ISchoolResultsCacheMessage[]
}

export class SchoolResultsCacheDeterminerService {
  private readonly dataService: ISchoolResultsCacheDeterminerDataService
  private readonly logger: ILogger
  private readonly functionBindings: ISchoolResultsCacheDeterminerFunctionBindings

  constructor (functionBindings: ISchoolResultsCacheDeterminerFunctionBindings | any, logger?: ILogger, dataService?: ISchoolResultsCacheDeterminerDataService) {
    this.functionBindings = functionBindings
    this.logger = logger ?? new ConsoleLogger()
    this.dataService = dataService ?? new SchoolResultsCacheDeterminerDataService(this.logger)
  }

  private async isInDateRangeForCaching (): Promise<boolean> {
    const checkWindow = await this.dataService.sqlFindActiveCheckWindow()
    const now = moment()
    this.logger.verbose('NOW is ', now)
    const firstMondayAfterCheckEnds = moment(checkWindow.checkEndDate).add(1, 'weeks').isoWeekday('Monday').set({ hour: 6, minutes: 0, seconds: 0 })
    this.logger.verbose('First monday after check ends', firstMondayAfterCheckEnds)
    if (now.isBefore(checkWindow.checkEndDate)) {
      // There is no need to start caching the school results until the live check period has finished.
      this.logger.info(`${functionName}: isInDateRangeForCaching: false (reason: live check window has not closed)`)
      return false
    }

    if (now.isAfter(firstMondayAfterCheckEnds)) {
      // It needs to be in the cache before the results open, not much point doing it after.
      this.logger.info(`${functionName}: isInDateRangeForCaching: false (reason: results are already open)`)
      return false
    }

    // date is in the range between the close of the live check window and 6am the first monday after the close.
    this.logger.info(`${functionName}: isInDateRangeForCaching: true)`)
    return true
  }

  private async addMessagesToSchoolResultsCacheQueue (): Promise<void> {
    this.logger.info(`${functionName}: addMessagesToSchoolResultsCacheQueue() called`)
    const schools = await this.dataService.sqlGetSchoolGuids()
    if (!Array.isArray(schools)) {
      throw new Error('schools is not an array')
    }
    this.functionBindings.schoolResultsCache = []
    // ~18K schools in prod
    schools.forEach(school => {
      this.functionBindings.schoolResultsCache.push({
        schoolGuid: school.schoolGuid,
        schoolName: school.schoolName
      })
    })
    this.logger.info(`${functionName}: addMessagesToSchoolResultsCacheQueue() ${schools.length} schools`)
  }

  private async dateRangeCheckAndCache (): Promise<void> {
    const shouldCache = await this.isInDateRangeForCaching()
    if (shouldCache) {
      await this.addMessagesToSchoolResultsCacheQueue()
    }
  }

  async execute (): Promise<void> {
    switch (config.SchoolResultsCacheDeterminer.cache) {
      case 0:
        // never cache
        this.logger.info(`${functionName}: execute: not going to cache because of config override`)
        break
      case 1:
        // cache based on current date
        this.logger.info(`${functionName}: execute: caching will be determined by the current date`)
        await this.dateRangeCheckAndCache()
        break
      case 2:
        // always cache, irrespective of the date
        this.logger.info(`${functionName}: execute: caching requested by config override`)
        await this.addMessagesToSchoolResultsCacheQueue()
        break
      default:
        this.logger.info(`${functionName}: execute: bad config [${config.SchoolResultsCacheDeterminer.cache}] so caching will be determined by the date`)
        await this.dateRangeCheckAndCache()
    }
  }
}

export interface ISchoolResultsCacheDeterminerDataService {
  sqlFindActiveCheckWindow (): Promise<any>
  sqlGetSchoolGuids (): Promise<Array<{ schoolName: string, schoolGuid: string }>>
}

export class SchoolResultsCacheDeterminerDataService implements ISchoolResultsCacheDeterminerDataService {
  private readonly sqlService: SqlService

  constructor (logger?: ILogger) {
    this.sqlService = new SqlService(logger)
  }

  async sqlFindActiveCheckWindow (): Promise<ICheckWindow> {
    const sql = `SELECT TOP 1 id, name, isDeleted, checkEndDate, adminEndDate
                   FROM [mtc_admin].[checkWindow]
                  WHERE isDeleted = 0
                    AND GETUTCDATE() > adminStartDate
                    AND GETUTCDATE() < adminEndDate`
    const result = await this.sqlService.query(sql, [])
    // @ts-ignore ramda has low type support
    return R.head(result)
  }

  async sqlGetSchoolGuids (): Promise<Array<{ schoolName: string, schoolGuid: string }>> {
    const sql = 'SELECT name as schoolName, urlSlug as schoolGuid FROM mtc_admin.school'
    return this.sqlService.query(sql)
  }
}

export interface ICheckWindow {
  id: number
  name: string
  isDeleted: boolean
  checkEndDate: moment.Moment
  adminEndDate: moment.Moment
}
