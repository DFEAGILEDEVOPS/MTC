const ejs = require('ejs')
const fs = require('fs')
const path = require('path')

const viewsPath = path.join(__dirname, '../../../views')
const template = fs.readFileSync(path.join(viewsPath, 'superuser/home.ejs'), 'utf8')
const serviceMessageTemplate = fs.readFileSync(path.join(viewsPath, 'partials/_service_message.ejs'), 'utf8')

function renderHome (serviceMessages) {
  return ejs.render(template, {
    breadcrumbs: [],
    serviceMessages,
    partial: (name, locals) => name === 'partials/_service_message' ? ejs.render(serviceMessageTemplate, locals) : ''
  })
}

describe('superuser homepage', () => {
  test('renders the pupil search link and description', () => {
    const html = renderHome([])
    expect(html).toContain('href="/service-manager/pupil-search">Pupil search</a>')
    expect(html).toContain('<p>Administer Pupils</p>')
  })

  test('links to the service message overview instead of directly to the create form', () => {
    const html = renderHome([])
    expect(html).toContain('href="/service-message">Service message</a>')
    expect(html).toContain('<p>Add or delete a global service message for the school homepage</p>')
    expect(html).not.toContain('href="/service-message/service-message-form"')
  })

  test('renders service messages above the page heading', () => {
    const html = renderHome([{
      title: 'Service maintenance',
      message: '<p>The service will be unavailable this evening.</p>',
      borderColourCode: 'O'
    }])
    expect(html).toContain('Service maintenance')
    expect(html).toContain('<p>The service will be unavailable this evening.</p>')
    expect(html).toContain('mtc-notification-banner-orange')
    expect(html.indexOf('Service maintenance')).toBeLessThan(html.indexOf('MTC Superuser'))
  })

  test('renders the homepage without a banner when there are no service messages', () => {
    const html = renderHome([])
    expect(html).toContain('MTC Superuser')
    expect(html).not.toContain('data-module="govuk-notification-banner"')
  })
})
