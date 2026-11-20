const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const { JSDOM } = require('jsdom')
const moment = require('moment-timezone')
const { PupilHistoryFilterService } = require('../../../services/pupil-history/pupil-history-filter.service')

describe('shared pupil history filters', () => {
  const viewsDir = path.join(__dirname, '../../../views')
  const filterScript = fs.readFileSync(path.join(__dirname, '../../../assets/javascripts/pupil-history-filters.js'), 'utf8')
  const enhanceFilters = document => {
    document.defaultView.eval(filterScript)
    document.dispatchEvent(new document.defaultView.Event('DOMContentLoaded'))
  }
  const timeline = [
    { action: 'Restart', occurredAt: moment.tz('2026-05-03', 'Europe/London') },
    {
      action: 'Pin generated',
      occurredAt: moment.tz('2026-05-02', 'Europe/London'),
      check: { isLiveCheck: true, active: true, checkCode: 'test-code', checkStatus: 'Pin generated' }
    }
  ]
  const pupil = {
    urlSlug: '4dc3212a-92ca-46da-b4bc-2cb7881ec593',
    lastName: 'Example',
    foreName: 'Pupil',
    firstName: 'Pupil',
    middleNames: '',
    dateOfBirth: '2015-01-01',
    restartAvailable: false,
    isDiscretionaryRestartAvailable: false
  }
  const render = (view, query, clearFiltersUrl) => {
    const locals = {
      pupil,
      pupilHistory: { pupil, meta: { restartsTakenCount: 1 }, checks: [{}, {}, {}] },
      historyView: PupilHistoryFilterService.filter(timeline, query),
      clearFiltersUrl,
      breadcrumbs: [],
      isStaAdmin: true,
      csrftoken: 'test-token',
      guidancePdf: '/guidance',
      formatFullGdsDate: date => date,
      formatPupilHistoryDataAndTime: date => date.format('D MMM YYYY HH:mm')
    }
    const renderPartial = (name, data) => {
      if (!['partials/_pupil-history', 'partials/_pupil-history-filters', 'partials/_form-error'].includes(name)) return ''
      return ejs.render(fs.readFileSync(path.join(viewsDir, `${name}.ejs`), 'utf8'), {
        ...locals, ...data, partial: renderPartial
      })
    }
    const html = ejs.render(fs.readFileSync(path.join(viewsDir, `${view}.ejs`), 'utf8'), {
      ...locals, partial: renderPartial
    })
    return new JSDOM(html, { runScripts: 'outside-only' }).window.document
  }

  test.each([
    ['pupil-register/pupil-history', `/pupil-register/history/${pupil.urlSlug}`],
    ['service-manager/pupil-summary', `/service-manager/pupil-summary/${pupil.urlSlug}`]
  ])('expands and collapses filters with a non-submit button on %s', (view, url) => {
    const document = render(view, { 'history-check-type': 'official', 'history-active': 'true' }, url)
    enhanceFilters(document)
    const panel = document.querySelector('#pupil-history-filter-options')
    const button = document.querySelector('button[aria-controls="pupil-history-filter-options"]')
    expect(button.textContent).toBe('Filter')
    expect(button.type).toBe('button')
    expect(button.closest('form')).toBeNull()
    expect(button.nextElementSibling).toBe(panel)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)
    button.click()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(panel.hidden).toBe(false)
    document.querySelector('#history-action').value = 'Restart'
    button.click()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(panel.hidden).toBe(true)
    button.click()
    expect(document.querySelector('#history-action').value).toBe('Restart')
    expect(document.querySelectorAll('#pupil-history tbody tr')).toHaveLength(2)
  })

  test.each([
    { 'history-action': 'Restart' },
    { 'history-from-day': '2', 'history-from-month': '5', 'history-from-year': '2026' },
    { 'history-to-day': '2', 'history-to-month': '5', 'history-to-year': '2026' },
    { 'history-action': 'invalid action' },
    { 'history-from-day': 'invalid day' }
  ])('keeps options expanded when filters or errors are present: %j', query => {
    const document = render('service-manager/pupil-summary', query, '/service-manager/pupil-summary/test')
    enhanceFilters(document)
    expect(document.querySelector('#pupil-history-filter-options').hidden).toBe(false)
    expect(document.querySelector('button[aria-controls]').getAttribute('aria-expanded')).toBe('true')
  })

  test('keeps filters accessible without JavaScript', () => {
    const document = render('service-manager/pupil-summary', {}, '/service-manager/pupil-summary/test')
    expect(document.querySelector('#pupil-history-filter-options').hidden).toBe(false)
    expect(document.querySelector('button[aria-controls]')).toBeNull()
  })

  test('does not add a filter button on pages without history filters', () => {
    const document = new JSDOM('<main></main>', { runScripts: 'outside-only' }).window.document
    enhanceFilters(document)
    expect(document.querySelector('button')).toBeNull()
  })

  test.each([
    ['pupil-register/pupil-history', `/pupil-register/history/${pupil.urlSlug}`],
    ['service-manager/pupil-summary', `/service-manager/pupil-summary/${pupil.urlSlug}`]
  ])('renders working shared controls on %s', (view, url) => {
    const document = render(view, {
      'history-action': 'Pin generated',
      'history-from-day': '2', 'history-from-month': '5', 'history-from-year': '2026'
    }, url)
    const form = document.querySelector('form[method="get"]')
    expect(form.getAttribute('action')).toBe(url)
    expect(form.querySelector('button').textContent).toBe('Apply filters')
    expect(form.querySelector('a').getAttribute('href')).toBe(url)
    expect(document.querySelector('#history-action').value).toBe('Pin generated')
    expect(document.querySelector('#history-check-type')).toBeNull()
    expect(document.querySelector('#history-active')).toBeNull()
    expect(Array.from(form.querySelectorAll('input, select'), control => control.name)).toEqual([
      'history-action',
      'history-from-day', 'history-from-month', 'history-from-year',
      'history-to-day', 'history-to-month', 'history-to-year'
    ])
    expect(document.querySelector('#history-from-day').value).toBe('2')
    expect(document.querySelector('#history-from-month').value).toBe('5')
    expect(document.querySelector('#history-from-year').value).toBe('2026')
    expect(document.querySelectorAll('#pupil-history tbody tr')).toHaveLength(1)
    expect(document.body.textContent).toContain('Showing 1 of 2 events')
    expect(document.querySelectorAll('form form')).toHaveLength(0)
    form.querySelectorAll('input, select').forEach(control => {
      expect(form.querySelector(`label[for="${control.id}"]`)).not.toBeNull()
    })
  })

  test('shows an explicit no-match message and preserves administrative controls', () => {
    const document = render('pupil-register/pupil-history', {
      'history-action': 'Restart',
      'history-to-day': '2', 'history-to-month': '5', 'history-to-year': '2026'
    }, '/pupil-register/history/test')
    expect(document.querySelector('#pupil-history')).toBeNull()
    expect(document.body.textContent).toContain('No events match your filters.')
    expect(document.body.textContent).not.toContain('No pupil history recorded')
    expect(document.querySelector('form[action="/restart/allow-discretionary-restart"]')).not.toBeNull()
  })

  test('renders an empty history differently from an empty filtered result', () => {
    const result = PupilHistoryFilterService.filter([], {})
    const html = ejs.render(fs.readFileSync(path.join(viewsDir, 'partials/_pupil-history.ejs'), 'utf8'), {
      historyView: result,
      clearFiltersUrl: '/history',
      partial: () => ''
    })
    expect(html).toContain('No pupil history recorded')
    expect(html).not.toContain('No events match your filters')
  })

  test('renders date errors with linked summary, group descriptions and retained escaped input', () => {
    const input = '<script>alert(1)</script>'
    const document = render('service-manager/pupil-summary', {
      'history-from-day': input
    }, '/service-manager/pupil-summary/test')
    expect(document.querySelector('.govuk-error-summary a').getAttribute('href')).toBe('#history-from-day')
    expect(document.querySelector('#history-from-day').value).toBe(input)
    expect(document.querySelector('#history-from-day').classList.contains('govuk-input--error')).toBe(true)
    expect(document.querySelector('#history-from-day').closest('fieldset').getAttribute('aria-describedby')).toContain('history-from-error')
    expect(document.querySelector('#history-from-error').textContent).toContain('From date must be a real date')
    expect(document.querySelector('script')).toBeNull()
    expect(document.body.textContent).toContain('Correct the filters to view pupil history.')
    expect(document.body.textContent).not.toContain('No events match your filters.')
  })

  test('clearing filters restores all events and default controls', () => {
    const document = render('service-manager/pupil-summary', {}, '/service-manager/pupil-summary/test')
    expect(document.querySelector('#history-action').value).toBe('')
    expect(document.querySelector('#history-from-day').value).toBe('')
    expect(document.querySelectorAll('#pupil-history tbody tr')).toHaveLength(2)
    expect(document.querySelector('.govuk-error-summary')).toBeNull()
  })
})

const template = fs.readFileSync(path.join(__dirname, '../../../views/pupil-register/pupil-history.ejs'), 'utf8')

function renderHistory (isStaAdmin, restartAvailable = false, checkCount = 3, isDiscretionaryRestartAvailable = false) {
  return ejs.render(template, {
    breadcrumbs: [],
    pupilHistory: {
      pupil: {
        foreName: 'Test',
        lastName: 'Pupil',
        middleNames: '',
        urlSlug: 'test-pupil',
        restartAvailable,
        isDiscretionaryRestartAvailable
      },
      checks: Array.from({ length: checkCount }, () => ({ receivedByServerAt: null, isLiveCheck: true })),
      meta: { restartsTakenCount: 1 }
    },
    isStaAdmin,
    csrftoken: 'test-csrf-token',
    partial: () => '',
    formatFullGdsDate: () => '',
    formatPupilHistoryDataAndTime: () => ''
  })
}

describe('pupil history discretionary restart controls', () => {
  test('renders the grant button for an eligible pupil with STA-admin privileges, including superuser', () => {
    const html = renderHistory(true)
    expect(html).toContain('Allow a discretionary restart')
    expect(html).toContain('action="/restart/allow-discretionary-restart"')
    expect(html).toContain('value="test-pupil"')
  })

  test.each([
    [false, false, 3],
    [true, true, 3],
    [true, false, 2]
  ])('does not render the grant button with privileges=%s, restartAvailable=%s, checks=%s', (isStaAdmin, restartAvailable, checkCount) => {
    expect(renderHistory(isStaAdmin, restartAvailable, checkCount)).not.toContain('Allow a discretionary restart')
  })

  test('renders the revoke button for an existing discretionary permission with STA-admin privileges', () => {
    expect(renderHistory(true, false, 3, true)).toContain('action="/restart/remove-discretionary-restart"')
    expect(renderHistory(false, false, 3, true)).not.toContain('action="/restart/remove-discretionary-restart"')
  })
})
