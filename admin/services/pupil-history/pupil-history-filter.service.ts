import moment, { type Moment } from 'moment-timezone'
import * as config from '../../config'
import { type IPupilHistoryEvent } from './pupil-history-service'
const ValidationError = require('../../lib/validation-error')

const actions: IPupilHistoryEvent['action'][] = [
  'Pin generated', 'Logged in', 'Check received', 'Check complete', 'Restart', 'Restart removed'
]

export class PupilHistoryFilterService {
  public static filter (timeline: IPupilHistoryEvent[], query: Record<string, unknown> = {}) {
    const error = new ValidationError()
    const read = (field: string, errorField = field): string => {
      const value = query[field]
      if (value === undefined) return ''
      if (typeof value !== 'string') {
        error.addError(errorField, 'Enter a single value for this filter')
        return ''
      }
      return value.trim()
    }
    const readDate = (prefix: string) => ({
      day: read(`${prefix}-day`),
      month: read(`${prefix}-month`, `${prefix}-day`),
      year: read(`${prefix}-year`, `${prefix}-day`)
    })
    const filters = {
      action: read('history-action'),
      from: readDate('history-from'),
      to: readDate('history-to')
    }
    if (filters.action !== '' && !actions.some(action => action === filters.action)) {
      error.addError('history-action', 'Select an action from the list')
    }
    const parseDate = (date: typeof filters.from, prefix: string, label: string): Moment | undefined => {
      if (Object.values(date).every(value => value === '')) return undefined
      const value = `${date.year}-${date.month.padStart(2, '0')}-${date.day.padStart(2, '0')}`
      const parsed = moment.tz(value, 'YYYY-MM-DD', true, config.DEFAULT_TIMEZONE)
      if (!/^\d{1,2}$/.test(date.day) || !/^\d{1,2}$/.test(date.month) ||
        !/^\d{4}$/.test(date.year) || !parsed.isValid()) {
        error.addError(`${prefix}-day`, `${label} must be a real date including a day, month and four-digit year`)
        return undefined
      }
      return parsed
    }
    const from = parseDate(filters.from, 'history-from', 'From date')
    const to = parseDate(filters.to, 'history-to', 'To date')
    if (from !== undefined && to !== undefined && from.isAfter(to)) {
      error.addError('history-to-day', 'To date must be the same as or after From date')
    }
    const toExclusive = to?.clone().add(1, 'day')
    const filteredTimeline = error.hasError() ?
        [] :
        timeline.filter(event =>
          (filters.action === '' || event.action === filters.action) &&
          (from === undefined || !event.occurredAt.isBefore(from)) &&
          (toExclusive === undefined || event.occurredAt.isBefore(toExclusive))
        )
    return { timeline: filteredTimeline, filters, error, actions, totalCount: timeline.length }
  }
}
