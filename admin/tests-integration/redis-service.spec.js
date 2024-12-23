const redisService = require('../services/tech-support/redis.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const data = [
  { key: 'checkForms:1', value: 'testOne' },
  { key: 'checkWindow.sqlFindActiveCheckWindow', value: 'testTwo' },
  { key: 'lacodes', value: 'testThree' },
  { key: 'group.sqlFindGroups', value: 'testFour' },
  { key: 'pupilRegisterViewData:1', value: 'testFive' },
  { key: 'result:1', value: 'testFive' },
  { key: 'sasToken:1', value: 'testSix' },
  { key: 'schoolData.sqlFindOneById', value: 'testSeven' },
  { key: 'settings', value: 'testEight' }
]

describe('the tech support role can drop redis keys', () => {
  afterAll(async () => { await redisCacheService.disconnect() })

  test('it can drop all allowed keys', async () => {
    // setup: create all keys we can delete
    await createAllowedKeys()

    for (const datum of data) {
      const retrievedVal = await redisCacheService.get(datum.key)
      if (retrievedVal === undefined) {
        fail(`key ${datum.key} was not set in the test setup`)
      }

      // test we should be able to drop each of these keys
      await redisService.dropKeyIfAllowed(datum.key)

      // check confirm the key is no longer there
      const retrievedVal2 = await redisCacheService.get(datum.key)
      expect(retrievedVal2).toBeUndefined()
    }
  })

  test('it is not allowed to drop pupil checks', async () => {
    // test setup
    redisCacheService.set('preparedCheck:aaa111aaa:1234', 'testOne', 100)

    // attempt drop
    const isAllowed = await redisService.dropKeyIfAllowed('preparedCheck:aaa111aaa:1234')

    // confirm expectation
    expect(isAllowed).toBe(false)
    const retrievedVal = await redisCacheService.get('preparedCheck:aaa111aaa:1234')
    expect(retrievedVal).toBe('testOne')
  })

  test('it is not allowed to drop some random key', async () => {
    // test setup
    redisCacheService.set('sdlkfjsldkfjs', 'testOne', 1)

    // attempt drop
    const isAllowed = await redisService.dropKeyIfAllowed('sdlkfjsldkfjs')

    // confirm expectation
    expect(isAllowed).toBe(false)
    const retrievedVal = await redisCacheService.get('sdlkfjsldkfjs')
    expect(retrievedVal).toBe('testOne')
  })

  test('can drop multiple keys at once', async () => {
    // test setup
    await createMultiKeys('checkForm')

    // sut - drop all checkForms
    await redisService.multiDrop(['checkForm'])

    // Expect
    for (let i = 1; i <= 100; i++) {
      const val = await redisCacheService.get(`checkForm${i}`)
      expect(val).toBeUndefined()
    }
  })

  test('can drop multiple keys with multiple tokens at once', async () => {
    // test setup
    await createMultiKeys('group')
    await createMultiKeys('pupilRegister')

    // sut - drop all checkForms
    await redisService.multiDrop(['group', 'pupilRegister'])

    // Expect
    for (let i = 1; i <= 100; i++) {
      const gval = await redisCacheService.get(`group${i}`)
      expect(gval).toBeUndefined()
      const pval = await redisCacheService.get(`pupilRegister${i}`)
      expect(pval).toBeUndefined()
    }
  })
})

async function createAllowedKeys () {
  for (const datum of data) {
    await redisCacheService.set(datum.key, datum.value, 60)
  }
}

async function createMultiKeys (prefix) {
  for (let i = 1; i <= 100; i++) {
    await redisCacheService.set(`${prefix}${i}`, `${prefix}${i}`, 61)
  }
}
