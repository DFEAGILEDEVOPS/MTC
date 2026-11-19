const ejs = require('ejs')
const fs = require('fs')
const path = require('path')

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
