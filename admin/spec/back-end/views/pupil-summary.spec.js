const { JSDOM } = require('jsdom')
const moment = require('moment-timezone')
const ejsUtil = require('../../../lib/ejs-util')
const dateService = require('../../../services/date.service')
const { PupilHistoryFilterService } = require('../../../services/pupil-history/pupil-history-filter.service')

describe.each(['service-manager/pupil-summary', 'pupil-register/pupil-history'])('%s history', (view) => {
  const render = async (timeline, isStaAdmin = true) => {
    const historyView = PupilHistoryFilterService.filter(timeline)
    const clearFiltersUrl = view === 'service-manager/pupil-summary' ?
      '/service-manager/pupil-summary/pupil-slug' :
      '/pupil-register/history/pupil-slug'
    const filterErrors = await ejsUtil.render('partials/_form-error', {
      error: historyView.error,
      pageFields: ['history-action', 'history-from-day', 'history-to-day']
    })
    const historyFilters = await ejsUtil.render('partials/_pupil-history-filters', {
      historyView,
      clearFiltersUrl,
      partial: () => filterErrors
    })
    const historyTable = await ejsUtil.render('partials/_pupil-history', {
      historyView,
      clearFiltersUrl,
      partial: () => historyFilters,
      formatPupilHistoryDataAndTime: dateService.formatPupilHistoryDateAndTime
    })
    return ejsUtil.render(view, {
      partial: (name, data) => {
        if (name !== 'partials/_pupil-history') return ''
        expect(data.historyView).toBe(historyView)
        expect(data.clearFiltersUrl).toBe(clearFiltersUrl)
        return historyTable
      },
      breadcrumbs: [],
      guidancePdf: '/guidance',
      pupil: {
        firstName: 'Example',
        lastName: 'Pupil',
        urlSlug: 'pupil-slug',
        isAnnulled: false,
        isFrozen: false
      },
      pupilHistory: {
        pupil: {
          foreName: 'Example',
          middleNames: '',
          lastName: 'Pupil',
          restartAvailable: false,
          isDiscretionaryRestartAvailable: false,
          urlSlug: 'pupil-slug'
        },
        checks: [{}, {}, {}],
        restarts: [],
        meta: { restartsTakenCount: 0 }
      },
      historyView,
      clearFiltersUrl,
      isStaAdmin,
      isServiceManager: true,
      csrftoken: 'csrf-token',
      formatFullGdsDate: () => '',
      formatPupilHistoryDataAndTime: dateService.formatPupilHistoryDateAndTime
    })
  }

  test('renders every supplied action in order with check and restart details', async () => {
    const occurredAt = moment.tz('2026-10-20T09:00:00Z', 'Europe/London')
    const check = { checkCode: 'check-1', isLiveCheck: true, active: true, checkStatus: 'Check complete' }
    const restart = { restartReason: 'IT issue <script>alert(1)</script>', recordedByUser: 'Example User' }
    const events = [
      { occurredAt, action: 'Restart', restart },
      ...['Check complete', 'Check received', 'Logged in', 'Pin generated'].map(action => ({
        occurredAt, action, check
      })),
      { occurredAt, action: 'Pin generated', check: { ...check, isLiveCheck: false, active: false } }
    ]

    const document = new JSDOM(await render(events)).window.document
    const rows = [...document.querySelectorAll('#pupil-history tbody tr')]

    expect(rows).toHaveLength(events.length)
    expect(rows.map(row => row.cells[1].textContent)).toEqual(events.map(event => event.action))
    expect(rows[0].cells[5].textContent).toBe(restart.restartReason)
    expect(rows[0].cells[6].textContent).toBe('Example User')
    expect(rows[1].cells[1].title).toBe('check-1')
    expect(rows[1].cells[2].textContent).toBe('Official')
    expect(rows[1].cells[3].textContent).toBe('*')
    expect(rows[1].cells[4].textContent).toBe('Check complete')
    expect(rows[5].cells[2].textContent).toBe('Try it out')
    expect(rows[5].cells[3].textContent).toBe('')
    expect(rows[0].querySelector('time').dateTime).toBe(occurredAt.toISOString())
    expect(document.querySelectorAll('script')).toHaveLength(0)
    expect(document.querySelectorAll('table')).toHaveLength(1)
    if (view === 'service-manager/pupil-summary') {
      expect(document.querySelector('a[href="/service-manager/pupil/freeze/pupil-slug"]')).not.toBeNull()
    } else {
      expect(document.querySelector('form[action="/restart/allow-discretionary-restart"]')).not.toBeNull()
    }
  })

  test('shows the original restart and its removal with the appropriate times and users', async () => {
    const createdAt = moment.tz('2026-10-20T09:00:00Z', 'Europe/London')
    const deletedAt = createdAt.clone().add(5, 'minutes')
    const restart = { restartReason: 'IT issue', recordedByUser: 'Original User', deletedByUser: 'Removing User' }
    const document = new JSDOM(await render([
      { occurredAt: deletedAt, action: 'Restart removed', restart },
      { occurredAt: createdAt, action: 'Restart', restart }
    ])).window.document
    const rows = [...document.querySelectorAll('#pupil-history tbody tr')]

    expect(rows).toHaveLength(2)
    expect(rows.map(row => row.cells[1].textContent)).toEqual(['Restart removed', 'Restart'])
    expect(rows.map(row => row.cells[6].textContent)).toEqual(['Removing User', 'Original User'])
    expect(rows.map(row => row.querySelector('time').dateTime)).toEqual([deletedAt.toISOString(), createdAt.toISOString()])
    rows.forEach(row => {
      expect(row.cells[5].textContent).toBe('IT issue')
      expect(row.cells[3].textContent).toBe('')
      expect(row.cells[4].textContent).toBe('')
    })
  })

  test('does not expose STA-admin restart controls to other roles', async () => {
    const document = new JSDOM(await render([], false)).window.document
    expect(document.querySelector('form[action="/restart/allow-discretionary-restart"]')).toBeNull()
    expect(document.querySelector('form[action="/restart/remove-discretionary-restart"]')).toBeNull()
  })

  test('shows an explicit empty history message', async () => {
    const document = new JSDOM(await render([])).window.document
    expect(document.body.textContent).toContain('No pupil history recorded')
    expect(document.querySelector('#pupil-history')).toBeNull()
  })
})
