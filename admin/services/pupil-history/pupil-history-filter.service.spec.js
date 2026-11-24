const moment = require('moment-timezone')
const { PupilHistoryFilterService } = require('./pupil-history-filter.service')

describe('PupilHistoryFilterService', () => {
  const official = { id: 1, isLiveCheck: true, active: true }
  const practice = { id: 2, isLiveCheck: false, active: false }
  const timeline = [
    { action: 'Restart removed', occurredAt: moment.tz('2026-05-04', 'Europe/London') },
    { action: 'Restart', occurredAt: moment.tz('2026-05-03', 'Europe/London') },
    { action: 'Check complete', occurredAt: moment.tz('2026-05-02T23:59:59.999', 'Europe/London'), check: official },
    { action: 'Check received', occurredAt: moment.tz('2026-05-02T10:00:00', 'Europe/London'), check: official },
    { action: 'Logged in', occurredAt: moment.tz('2026-05-02T09:00:00', 'Europe/London'), check: official },
    { action: 'Pin generated', occurredAt: moment.tz('2026-05-02T00:00:00', 'Europe/London'), check: official },
    { action: 'Pin generated', occurredAt: moment.tz('2026-05-01', 'Europe/London'), check: practice }
  ]
  const filter = query => PupilHistoryFilterService.filter(timeline, query)

  test('shows all events in their original order with no filters and does not mutate them', () => {
    const snapshot = timeline.slice()
    const result = filter({})
    expect(result.error.hasError()).toBe(false)
    expect(result.timeline).toEqual(timeline)
    expect(result.totalCount).toBe(7)
    expect(timeline).toEqual(snapshot)
  })

  test.each(['Pin generated', 'Logged in', 'Check received', 'Check complete', 'Restart', 'Restart removed'])(
    'filters by the %s action', action => {
      expect(filter({ 'history-action': action }).timeline).toEqual(timeline.filter(event => event.action === action))
    }
  )

  test.each([
    { 'history-check-type': 'official', 'history-active': 'true' },
    { 'history-check-type': { value: 'invalid' }, 'history-active': ['invalid'] }
  ])('ignores removed filters in previously saved URLs: %j', query => {
    const result = filter(query)
    expect(result.error.hasError()).toBe(false)
    expect(result.timeline).toEqual(timeline)
    expect(result.filters).not.toHaveProperty('checkType')
    expect(result.filters).not.toHaveProperty('activeOnly')
  })

  test('combines all filters using AND and retains submitted values', () => {
    const query = {
      'history-action': 'Check complete',
      'history-from-day': '2',
      'history-from-month': '5',
      'history-from-year': '2026',
      'history-to-day': '2',
      'history-to-month': '5',
      'history-to-year': '2026'
    }
    const result = filter(query)
    expect(result.error.hasError()).toBe(false)
    expect(result.timeline).toEqual([timeline[2]])
    expect(result.filters).toEqual({
      action: 'Check complete',
      from: { day: '2', month: '5', year: '2026' },
      to: { day: '2', month: '5', year: '2026' }
    })
  })

  test('uses inclusive London calendar dates rather than UTC boundaries', () => {
    const result = filter({
      'history-from-day': '02', 'history-from-month': '05', 'history-from-year': '2026',
      'history-to-day': '02', 'history-to-month': '05', 'history-to-year': '2026'
    })
    expect(result.error.hasError()).toBe(false)
    expect(result.timeline).toEqual(timeline.slice(2, 6))
  })

  test.each(['2026-03-29', '2026-10-25'])('includes the whole day across the clock change on %s', date => {
    const events = [
      { action: 'Restart', occurredAt: moment.tz(date, 'Europe/London').startOf('day') },
      { action: 'Restart', occurredAt: moment.tz(date, 'Europe/London').endOf('day') },
      { action: 'Restart', occurredAt: moment.tz(date, 'Europe/London').add(1, 'day').startOf('day') }
    ]
    const [year, month, day] = date.split('-')
    const result = PupilHistoryFilterService.filter(events, {
      'history-from-day': day, 'history-from-month': month, 'history-from-year': year,
      'history-to-day': day, 'history-to-month': month, 'history-to-year': year
    })
    expect(result.timeline).toEqual(events.slice(0, 2))
  })

  test('supports an open-ended From date', () => {
    expect(filter({
      'history-from-day': '3', 'history-from-month': '5', 'history-from-year': '2026'
    }).timeline).toEqual(timeline.slice(0, 2))
  })

  test('supports an open-ended To date', () => {
    expect(filter({
      'history-to-day': '1', 'history-to-month': '5', 'history-to-year': '2026'
    }).timeline).toEqual([timeline[6]])
  })

  test('returns no matches for incompatible valid filters', () => {
    const result = filter({
      'history-action': 'Restart',
      'history-to-day': '2', 'history-to-month': '5', 'history-to-year': '2026'
    })
    expect(result.error.hasError()).toBe(false)
    expect(result.timeline).toEqual([])
    expect(result.totalCount).toBe(7)
  })

  test.each([
    [{ 'history-action': 'Unknown' }, 'history-action'],
    [{ 'history-action': ['Restart', 'Logged in'] }, 'history-action'],
    [{ 'history-from-day': ['1', '2'] }, 'history-from-day'],
    [{ 'history-from-day': '1' }, 'history-from-day'],
    [{ 'history-from-day': '31', 'history-from-month': '2', 'history-from-year': '2026' }, 'history-from-day'],
    [{ 'history-to-day': '29', 'history-to-month': '2', 'history-to-year': '2026' }, 'history-to-day'],
    [{ 'history-to-day': '1', 'history-to-month': '13', 'history-to-year': '2026' }, 'history-to-day'],
    [{ 'history-to-day': '1', 'history-to-month': '5', 'history-to-year': '26' }, 'history-to-day']
  ])('reports invalid query %j without returning unfiltered results', (query, field) => {
    const result = filter(query)
    expect(result.error.isError(field)).toBe(true)
    expect(result.timeline).toEqual([])
  })

  test('accepts leap days in leap years', () => {
    expect(filter({
      'history-from-day': '29', 'history-from-month': '2', 'history-from-year': '2024'
    }).error.hasError()).toBe(false)
  })

  test('rejects a reversed date range', () => {
    const result = filter({
      'history-from-day': '3', 'history-from-month': '5', 'history-from-year': '2026',
      'history-to-day': '2', 'history-to-month': '5', 'history-to-year': '2026'
    })
    expect(result.error.get('history-to-day')).toBe('To date must be the same as or after From date')
    expect(result.timeline).toEqual([])
  })

  test('retains invalid date values for correction', () => {
    expect(filter({ 'history-from-day': 'not a day' }).filters.from.day).toBe('not a day')
  })
})
