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
    expect(sut.getBrowserFamily()).toBe('Chrome') // would be nice if it recognised Brave
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

  test('it returns macOS for the operating system', () => {
    expect(sut.getOperatingSystem()).toBe('macOS')
  })

  test('it returns 10 for the operating system major version', () => {
    expect(sut.getOperatingSystemMajorVersion()).toBe(10)
  })

  test('it returns 15 for the operating system minor version', () => {
    expect(sut.getOperatingSystemMinorVersion()).toBe(15)
  })

  test('it returns 7 for the operating system patch version', () => {
    expect(sut.getOperatingSystemPatchVersion()).toBe(7)
  })
})
