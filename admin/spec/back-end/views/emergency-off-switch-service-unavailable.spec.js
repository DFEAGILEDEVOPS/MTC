const ejs = require('ejs')
const fs = require('fs')
const path = require('path')

const template = fs.readFileSync(path.join(__dirname, '../../../views/availability/emergency-off-switch-service-unavailable.ejs'), 'utf8')

describe('emergency holding page', () => {
  test.each([
    [true, false, true],
    [true, true, false],
    [false, true, false]
  ])('shows sign out only to staff (authenticated: %s, pupil: %s)', (isAuthenticated, isPupil, showSignOut) => {
    const html = ejs.render(template, { isAuthenticated, isPupil, partial: () => '' })
    expect(html.includes('href="/sign-out"')).toBe(showSignOut)
  })
})
