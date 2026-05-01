import { type ISqlService, SqlService } from '../../sql/sql.service.js'
import { type ILogger } from '../../common/logger.js'
import { type ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service.js'
import {
  type IPrepareAnswersAndInputsDataService,
  PrepareAnswersAndInputsDataService
} from './prepare-answers-and-inputs.data.service.js'
import { type IPrepareEventService, PrepareEventService } from './prepare-event.service.js'
import { type IUserInputService, UserInputService } from './user-input.service.js'
import { type IQuestionService, QuestionService } from './question.service.js'
import { EventService, type IEventService } from './event.service.js'
import { SyncResultsService } from './sync-results.service.js'

export interface ISyncResultsServiceFactory {
  create: SyncResultsService
}

export class SyncResultsServiceFactory {
  private readonly eventService: IEventService
  private readonly logger: ILogger
  private readonly prepareAnswersAndInputsDataService: IPrepareAnswersAndInputsDataService
  private readonly prepareEventService: IPrepareEventService
  private readonly questionService: IQuestionService
  private readonly sqlService: ISqlService
  private readonly syncResultsDataService: ISyncResultsDataService
  private readonly userInputService: IUserInputService

  constructor (logger: ILogger) {
    this.logger = logger
    this.sqlService = new SqlService(this.logger)
    this.userInputService = new UserInputService(this.sqlService)
    this.questionService = new QuestionService(this.sqlService)
    this.eventService = new EventService(this.sqlService)
    this.prepareAnswersAndInputsDataService = new PrepareAnswersAndInputsDataService(this.questionService, this.userInputService)
    this.prepareEventService = new PrepareEventService(this.eventService, this.questionService)
    this.syncResultsDataService = new SyncResultsDataService(this.logger, this.sqlService, this.prepareAnswersAndInputsDataService, this.prepareEventService)
  }

  create (): SyncResultsService {
    return new SyncResultsService(this.logger, this.syncResultsDataService)
  }
}
