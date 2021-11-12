const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const santitiseService = {
  /**
   *
   * @param {string} dirty
   */
  sanitise: function santitiseFn (dirty) {
    if (typeof dirty !== 'string') {
      throw new Error('Invalid string')
    }
    const window = new JSDOM('').window
    // @ts-ignore
    const DOMPurify = createDOMPurify(window)
    // Allow safe html tags, but not svg or MathML
    const clean = DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } })
    return clean
  }
}

module.exports = santitiseService
