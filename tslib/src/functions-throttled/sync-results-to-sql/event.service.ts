import { type ISqlService, SqlService } from '../../sql/sql.service'
import { type DBEventType } from './models'
import { NVarChar } from 'mssql'

export interface IEventService {
  findOrCreateEventTypeId (eventTypeToFind: string): Promise<number>
}

export class EventService implements IEventService {
  private readonly sqlService: ISqlService
  private readonly eventTypeCache = new Map<string, DBEventType>()

  constructor (sqlService?: ISqlService) {
    this.sqlService = sqlService ?? new SqlService()
  }

  private async sqlGetEventTypes (): Promise<DBEventType[]> {
    const sql = 'SELECT id, eventType, eventDescription FROM mtc_results.eventTypeLookup'
    return this.sqlService.query(sql)
  }

  /**
   * Cache the database event types as a side effect.
   */
  private async refreshEventTypes (): Promise<void> {
    const data = await this.sqlGetEventTypes()
    data.forEach(o => {
      if (!this.eventTypeCache.has(o.eventType)) {
        this.eventTypeCache.set(o.eventType, o)
      }
    })
  }

  /**
   * Create a new event type dynamically
   *
   * @param eventType
   */
  private async createNewEventType (eventType: string): Promise<void> {
    const sql = `
        INSERT INTO mtc_results.eventTypeLookup (eventType, eventDescription)
        VALUES (@eventType, @eventDescription)
    `
    const date = new Date()
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}`
    const descr = `Dynamically created on ${dateStr}`
    const params = [
      { name: 'eventType', type: NVarChar(255), value: eventType.trim() },
      { name: 'eventDescription', type: NVarChar(4000), value: descr }
    ]
    await this.sqlService.modify(sql, params)
  }

  /**
   * Find an event in the event cache, or create a new event if it is not found
   * @param {string} eventTypeToFind
   * @private
   */
  public async findOrCreateEventTypeId (eventTypeToFind: string): Promise<number> {
    if (this.eventTypeCache.size === 0) {
      await this.refreshEventTypes()
    }
    if (!this.eventTypeCache.has(eventTypeToFind)) {
      // we have found a new event type
      await this.createNewEventType(eventTypeToFind)
      await this.refreshEventTypes()
    }
    const event = this.eventTypeCache.get(eventTypeToFind)
    if (event === undefined) {
      throw new Error(`Failed to find event ${eventTypeToFind}`)
    }
    return event.id
  }
}
