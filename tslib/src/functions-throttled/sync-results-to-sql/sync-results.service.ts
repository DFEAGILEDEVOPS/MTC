
import { ICheckCompletionMessage, DBQuestion } from './models'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ConsoleLogger, ILogger } from '../../common/logger'

const name = 'SyncResultsService'

export class SyncResultsService {
  private logger: ILogger
  private syncResultsDataService: ISyncResultsDataService
  public questionHash: Map<string, DBQuestion> | undefined

  constructor (logger?: ILogger, syncResultsDataService?: SyncResultsDataService) {
    if (!logger) {
      this.logger = new ConsoleLogger()
    } else {
      this.logger = logger
    }

    if (!syncResultsDataService) {
      this.syncResultsDataService = new SyncResultsDataService()
    } else {
      this.syncResultsDataService = syncResultsDataService
    }
  }

  public async process (checkCompletionMessage: ICheckCompletionMessage) {
    this.logger.info(`${name}: message received for check [${checkCompletionMessage.markedCheck.checkCode}]`)

    if (this.questionHash === undefined) {
      this.logger.info(`${name}: fetching question data`)
      this.questionHash = await this.syncResultsDataService.sqlGetQuestionData()
    }
  }
}
