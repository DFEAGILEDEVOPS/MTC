import { ISqlService, SqlService } from '../../sql/sql.service'
import { ILogger } from '../../common/logger'
import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import {
  IPrepareAnswersAndInputsDataService,
  PrepareAnswersAndInputsDataService
} from './prepare-answers-and-inputs.data.service'
import { IPrepareEventService, PrepareEventService } from './prepare-event.service'
import { IUserInputService, UserInputService } from './user-input.service'
import { IQuestionService, QuestionService } from './question.service'
import { EventService, IEventService } from './event.service'
import { SyncResultsService } from './sync-results.service'

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
