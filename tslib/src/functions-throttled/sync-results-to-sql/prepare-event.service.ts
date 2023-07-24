import { type ITransactionRequest } from '../../sql/sql.service'
import { type Audit, type DBQuestion } from './models'
import { TYPES } from 'mssql'
import { EventService, type IEventService } from './event.service'
import { type IQuestionService, QuestionService } from './question.service'

export interface IPrepareEventService {
  prepareEvent (audit: Audit, checkCode: string, index: number): Promise<ITransactionRequest>
}

export class PrepareEventService {
  private readonly eventService: IEventService
  private readonly questionService: IQuestionService

  constructor (eventService?: IEventService, questionService?: IQuestionService) {
    this.eventService = eventService ?? new EventService()
    this.questionService = questionService ?? new QuestionService()
  }

  public async prepareEvent (audit: Audit, checkCode: string, index: number): Promise<ITransactionRequest> {
    const eventTypeId = await this.eventService.findOrCreateEventTypeId(audit.type)
    let questionId = null
    let questionNumber = null
    let eventData: string | null = null
    let question: DBQuestion
    const auditParams = []

    if (audit.data !== undefined) {
      eventData = JSON.stringify(audit.data)
      if (audit.data.question !== undefined && audit.data.sequenceNumber !== undefined && audit.data.isWarmup !== undefined && !audit.data.isWarmup) {
        try {
          question = await this.questionService.findQuestion(audit.data.question)
          questionId = question.id
          questionNumber = audit.data.sequenceNumber
        } catch (ignoreError) {
          console.error(`Unable to find question [${audit.data.question}] for checkCode [${checkCode}]`)
          // the event will still get inserted, but it will not relate to a question.  The details will be in the eventData.
        }
      }
    }
    auditParams.push({ name: `eventTypeLookupId${index}`, type: TYPES.Int, value: eventTypeId })
    auditParams.push({ name: `eventBrowserTimestamp${index}`, type: TYPES.DateTimeOffset, value: audit.clientTimestamp })
    auditParams.push({ name: `eventData${index}`, type: TYPES.NVarChar, value: eventData })
    auditParams.push({ name: `eventQuestionId${index}`, type: TYPES.Int, value: questionId })
    auditParams.push({ name: `eventQuestionNumber${index}`, type: TYPES.SmallInt, value: questionNumber })

    const sql = `INSERT INTO mtc_results.[event] (checkResult_id,
                                 eventTypeLookup_id,
                                 browserTimestamp,
                                 eventData,
                                 question_id,
                                 questionNumber)
                      VALUES (@checkResultId,
                              @eventTypeLookupId${index},
                              @eventBrowserTimestamp${index},
                              @eventData${index},
                              @eventQuestionId${index},
                              @eventQuestionNumber${index});`

    return { sql, params: auditParams }
  }
}
