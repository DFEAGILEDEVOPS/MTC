const axios = require('axios')
const testData = require('./browser-data.json')

const req = async (userAgent) => {
  const response = await axios({
    method: 'get',
    url: 'http://localhost:8181/',
    headers: { 'User-Agent': userAgent },
    maxRedirects: 0,
    validateStatus: function (status) {
      return status >= 200 && status <= 302;
    }
  })
  return response
}

describe('browser support', () => {
    it('checks', async () => {
        for (const browser of testData.data) {
          const resp = await req(browser.agent)
          expect(resp.status)
            .withContext(`${browser.ident} failed`)
            .toBe(browser.isSupported ? 200 : 302)
        }
    })
})
