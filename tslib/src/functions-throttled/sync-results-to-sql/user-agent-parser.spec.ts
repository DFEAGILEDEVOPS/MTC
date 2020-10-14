import { UserAgentParser } from './user-agent-parser'

describe('UserAgentParser', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Brave Chrome/86.0.4240.75 Safari/537.36'
  let sut: UserAgentParser

  beforeEach(() => {
    sut = new UserAgentParser(ua)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it returns `Chrome` for the browser family', () => {
    // console.log(sut.uaParsed.getResult())
    expect(sut.getBrowserFamily()).toEqual('Chrome') // would be nice if it recognised Brave
  })

  test('it returns 86 for the browser major version', () => {
    expect(sut.getBrowserMajorVersion()).toBe(86)
  })

  test('it returns 0 for the browser minor version', () => {
    expect(sut.getBrowserMinorVersion()).toBe(0)
  })

  test('it returns 4240 for the browser patch version', () => {
    expect(sut.getBrowserPatchVersion()).toBe(4240)
  })
})
