import { stringUtil } from './string-util'

describe('string-util', () => {
  it('should return true for undefined', () => {
    expect(stringUtil.isEmptyOrUndefined(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(stringUtil.isEmptyOrUndefined('')).toBe(true)
  })

  it('should return false for non-empty string', () => {
    expect(stringUtil.isEmptyOrUndefined('a')).toBe(false)
  })
})
