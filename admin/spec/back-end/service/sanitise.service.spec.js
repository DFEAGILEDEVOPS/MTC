const sanitiseService = require('../../../services/sanitise.service')
const sut = sanitiseService

describe('sanitise.service', () => {
  test('it exists', () => {
    expect(sut).toBeDefined()
  })

  test('it returns a string', () => {
    expect(typeof sut.sanitise('foo')).toBe('string')
  })

  test('it throws when not passed a string as arg', () => {
    expect(() => { sut.sanitise({}) }).toThrow(/invalid string/i)
  })

  test('removes js from html', () => {
    const xss = '<img src=x onerror=alert(1)//>'
    expect(sut.sanitise(xss)).toBe('<img src="x">')
  })

  test('removes iframes', () => {
    const xss = '<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>'
    expect(sut.sanitise(xss)).toBe('<p>abc</p>')
  })

  test('removes mathml', () => {
    const xss = '<math><mi//xlink:href="data:x,<script>alert(4)</script>">'
    expect(sut.sanitise(xss)).toBe('')
  })

  test('it corrects closing tags', () => {
    const str = '<TABLE><tr><td>HELLO</tr></TABL>'
    expect(sut.sanitise(str)).toBe('<table><tbody><tr><td>HELLO</td></tr></tbody></table>')
  })

  test('it fixes links', () => {
    const str = '<UL><li><A HREF=//google.com>click</UL>'
    expect(sut.sanitise(str)).toBe('<ul><li><a href="//google.com">click</a></li></ul>')
  })
})
