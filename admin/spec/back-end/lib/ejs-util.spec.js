'use strict'
/* global test expect fail describe */

const sut = require('../../../lib/ejs-util')

describe('ejsUtil', () => {
  test('it renders a relative template', async () => {
    try {
      const html = await sut.render('access-arrangements/retro-input-assistant', {})
      expect(html).toContain('If you need to assign an input assistant after the pupil has taken the official check')
      console.log('html', html)
    } catch (error) {
      fail(error)
    }
  })

  test('it does not escape html entities', async () => {
    try {
      const html = await sut.render('access-arrangements/retro-input-assistant', {})
      expect(html).toContain('<div id="retroAddInputAssistantInfo">')
    } catch (error) {
      fail(error)
    }
  })
})
