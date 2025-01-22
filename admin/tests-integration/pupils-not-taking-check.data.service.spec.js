'use strict'

const R = require('ramda')

const pupilNotTakingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')
const sut = pupilNotTakingCheckDataService
const createCheck = require('./test-support/create-check')
const sqlService = require('../services/data-access/sql.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

// utility helper to fetch check details
async function getCheck (checkId) {
  const sql = `SELECT c.*, p.school_id, p.urlSlug as pupilUrlSlug, cp.pinExpiresAt
                 FROM mtc_admin.[check] c
                      JOIN mtc_admin.[pupil] p ON (c.pupil_id = p.id)
                      LEFT JOIN mtc_admin.[checkPin] cp ON (c.id = cp.check_id)
                WHERE c.id = @id`
  const params = [
    { name: 'id', value: checkId, type: sqlService.TYPES.Int }
  ]
  const data = await sqlService.query(sql, params)
  return R.head(data)
}

describe('pupils-not-taking-check.data.service: #sqlFindPupilsWithoutReasons', () => {
  beforeAll(async () => {
    await sqlService.initPool()
  })

  afterAll(async () => {
    await sqlService.drainPool()
    redisCacheService.disconnect()
  })

  // Find pupils eligible to be marked as not taking the check
  // Bug 47477: was including pupils who had completed a check in the narrow window between checkPin expiry and
  // checkPin deletion.
  test('does not retrieve pupils whose completed checks expired', async () => {
    // Create a new check and set it to completed by the pupil
    const newCheckId = await createCheck('CMP', 1)
    // Expire the pin
    const sql = `UPDATE [mtc_admin].[checkPin]
                    SET pinExpiresAt = DATEADD(day, -1, pinExpiresAt)
                  WHERE check_id = @checkId
    `
    const params = [
      { name: 'checkId', value: newCheckId, type: sqlService.TYPES.Int }
    ]
    await sqlService.modify(sql, params)
    // Fetch a copy of the check
    const check = await getCheck(newCheckId)

    // execute
    const sutData = await sut.sqlFindPupilsWithoutReasons(check.school_id)

    // test
    expect(sutData.find(element => element.urlSlug === check.pupilUrlSlug)).toBe(undefined)
  })
})
