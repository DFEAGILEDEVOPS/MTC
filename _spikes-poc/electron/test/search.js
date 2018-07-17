/* global describe it */

require('./hooks')
const assert = require('assert')

describe('application launch', function () {
  this.timeout(20000)

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })

  it('shows a title', function () {
    return this.app.client.getText('.heading-large').then(function (text) {
      assert.equal(text, 'Multiplication tables check demonstration')
    })
  })

  it('shows a intro', function () {
    return this.app.client.getText('.lede.text').then(function (text) {
      assert.equal(text, 'Welcome to the multiplication tables check (MTC). This prototype is purely for' +
        ' demonstration purposes, no data will be stored.' +
        ' We\'d love to hear your feedback at the end of this demonstration.')
    })
  })

  it('shows a logo', function () {
    return this.app.client.waitForVisible('.organisation-logo').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })

  it('shows logo text', function () {
    return this.app.client.getText('.organisation-logo').then(function (text) {
      assert.equal(text, 'Standards\n& Testing\nAgency')
    })
  })

  it('shows a global header', function () {
    return this.app.client.waitForVisible('#global-header').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })

  it('shows a footer', function () {
    return this.app.client.waitForVisible('#footer').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })

  it('shows a global header logo', function () {
    return this.app.client.waitForVisible('#logo').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })

  it('header logo links to homepage', function () {
    return this.app.client.waitForVisible('#logo[href="/"]').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })

  it('header has proposition text', function () {
    return this.app.client.getText('#proposition-name').then(function (text) {
      assert.equal(text, 'Multiplication Tables Check')
    })
  })

  it('proposition text links to homepage', function () {
    return this.app.client.waitForVisible('#proposition-name[href="/"]').then(function (boolean) {
      assert.equal(boolean, true)
    })
  })
})
