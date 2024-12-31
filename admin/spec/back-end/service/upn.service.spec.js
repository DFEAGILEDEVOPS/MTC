'use strict'

const upnService = require('../../../services/upn.service')

describe('upnService', () => {
  test('it can calculate a permanent upn check letter', () => {
    const leaCode = 201
    const deptNum = 1000
    const yearAlloc = 18
    const serial = '042'
    const protoUpn = `${leaCode}${deptNum}${yearAlloc}${serial}`
    const checkLetter = upnService.calculateCheckLetter(protoUpn)
    // 2 0 1 1 0 0 0 1 8 0 4 2
    // 2 x 2 = 4
    // 3 x 0 = 0
    // 4 x 1 = 4
    // 5 x 1 = 5
    // 6 x 0 = 0
    // 7 x 0 = 0
    // 8 x 0 = 0
    // 9 x 1 = 9
    // 10 x 8 = 80
    // 11 x 0 = 0
    // 12 x 4 = 48
    // 13 x 2 = 26
    // sum of the results above = 4 + 0 + 4 + 5 + 0 + 0 + 0 + 9 + 80 + 0 + 48 + 26 = 176
    // 176 / 23 = 7 remainder 15
    // Using the remainder lookup in the service we can see that 15 corresponds to 'R'
    expect(checkLetter).toBe('R')
  })

  test('it can calculate a temporary upn check letter', () => {
    const leaCode = 201
    const deptNum = 1000
    const yearAlloc = 18
    const serial = '04V'
    const protoUpn = `${leaCode}${deptNum}${yearAlloc}${serial}`
    const checkLetter = upnService.calculateCheckLetter(protoUpn)
    // 2 0 1 1 0 0 0 1 8 0 4 V => 2 0 1 1 0 0 0 1 8 0 4 18
    //
    // 2 x 2 = 4
    // 3 x 0 = 0
    // 4 x 1 = 4
    // 5 x 1 = 5
    // 6 x 0 = 0
    // 7 x 0 = 0
    // 8 x 0 = 0
    // 9 x 1 = 9
    // 10 x 8 = 80
    // 11 x 0 = 0
    // 12 x 4 = 48
    // 13 x 18 = 234
    // sum of the results above = 4 + 0 + 4 + 5 + 0 + 0 + 0 + 9 + 80 + 0 + 48 + 234 = 384
    // 384 / 23 = 16 remainder 16
    // Using the remainder lookup in the service we can see that 16 corresponds to 'T'
    expect(checkLetter).toBe('T')
  })

  test('it can calculate a temporary upn with an invalid check letter', () => {
    /**
     * This test assumes that the correct behaviour is to treat the invalid letter as 0, so it
     * has not effect on the check-letter.
     */
    const leaCode = 201
    const deptNum = 1000
    const yearAlloc = 18
    const serial = '04S' // S is not a valid check letter - too much like 5
    const protoUpn = `${leaCode}${deptNum}${yearAlloc}${serial}`
    const checkLetter = upnService.calculateCheckLetter(protoUpn)
    // 2 0 1 1 0 0 0 1 8 0 4 V => 2 0 1 1 0 0 0 1 8 0 4 0
    //
    // 2 x 2 = 4
    // 3 x 0 = 0
    // 4 x 1 = 4
    // 5 x 1 = 5
    // 6 x 0 = 0
    // 7 x 0 = 0
    // 8 x 0 = 0
    // 9 x 1 = 9
    // 10 x 8 = 80
    // 11 x 0 = 0
    // 12 x 4 = 48
    // 13 x 18 = 0
    // sum of the results above = 4 + 0 + 4 + 5 + 0 + 0 + 0 + 9 + 80 + 0 + 48 + 0 = 150
    // 150 / 23 = 6 remainder 12
    // Using the remainder lookup in the service we can see that 16 corresponds to 'T'
    expect(checkLetter).toBe('N')
  })
})
