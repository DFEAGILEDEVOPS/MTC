const { JSDOM } = require('jsdom')
const moment = require('moment-timezone')
const ejsUtil = require('../../../lib/ejs-util')
const dateService = require('../../../services/date.service')

describe('Service Manager pupil summary history', () => {
  const render = pupilHistory => ejsUtil.render('service-manager/pupil-summary', {
    partial: () => '',
    breadcrumbs: [],
    guidancePdf: '/guidance',
    pupil: {
      firstName: 'Example',
      lastName: 'Pupil',
      urlSlug: 'pupil-slug',
      isAnnulled: false,
      isFrozen: false
    },
    pupilHistory,
    formatPupilHistoryDataAndTime: dateService.formatPupilHistoryDateAndTime
  })

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
    expect(document.querySelector('a[href="/service-manager/pupil/freeze/pupil-slug"]')).not.toBeNull()
  })

  test('shows an explicit empty history message', async () => {
    const document = new JSDOM(await render([])).window.document
    expect(document.body.textContent).toContain('No pupil history recorded')
    expect(document.querySelector('#pupil-history')).toBeNull()
  })
})
