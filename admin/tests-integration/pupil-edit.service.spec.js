'use strict'

/**
 * @file Integration Tests for Pupil Edit Service
 */

const pupilAddService = require('../services/pupil-add-service')
const { faker } = require('@faker-js/faker')
const upnService = require('../services/upn.service')
const pupilTestService = require('./test-support/pupil-test.service')
const moment = require('moment')
const sqlService = require('../services/data-access/sql.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

const currentUTCDate = moment.utc()
const currentYear = currentUTCDate.year()
const academicYear = currentUTCDate.isBetween(moment.utc(`${currentYear}-01-01`),
  moment.utc(`${currentYear}-08-31`), null, '[]') ?
  currentYear - 1 :
  currentYear

function createFakeUpn () {
  const base = '201' + faker.datatype.number({ min: 100000000, max: 900000000 })
  const checkLetter = upnService.calculateCheckLetter(base)
  return checkLetter + base.toString()
}

function fakePupilData () {
  const gender = faker.helpers.arrayElement(['M', 'F'])
  const dob = moment(`${academicYear}-08-31`)
    .subtract(8, 'years')
    .subtract(faker.datatype.number({ min: 0, max: 364 }), 'days') // randomise dob

  return {
    school_id: 1,
    upn: createFakeUpn(),
    foreName: faker.name.firstName(gender === 'M' ? 'male' : 'female'),
    middleNames: faker.name.middleName(gender === 'M' ? 'male' : 'female'),
    lastName: faker.name.lastName(),
    foreNameAlias: '',
    lastNameAlias: '',
    gender,
    'dob-year': dob.year().toString(),
    'dob-month': (dob.month() + 1).toString().padStart(2, '0'), // months are zero-indexed
    'dob-day': dob.date().toString().padStart(2, '0')
  }
}

describe('pupilEditService', () => {
  const schoolId = 1
  const userId = 1

  afterAll(async () => {
    await sqlService.drainPool()
    redisCacheService.disconnect()
  })

  test('it sets the isEdited flag when the foreName changes', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateForename(dbPupilData.id, 'Testforename')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.foreName).toBe('Testforename')
  })

  test('it does NOT set the isEdited flag when the middlesNames change', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateMiddlenames(dbPupilData.id, 'New Middle Names')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)
    expect(newPupilData.isEdited).toBe(false)
    expect(newPupilData.middleNames).toBe('New Middle Names')
  })

  test('it sets the isEdited flag when the lastName changes', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateLastname(dbPupilData.id, 'NewLastName')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.lastName).toBe('NewLastName')
  })

  test('it sets the isEdited flag when the gender changes', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateGender(dbPupilData.id, dbPupilData.gender === 'M' ? 'F' : 'M')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.gender).toBe(dbPupilData.gender === 'M' ? 'F' : 'M')
  })

  test('it sets the isEdited flag when the UPN changes', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    const newUpn = createFakeUpn()
    await pupilTestService.updateUPN(dbPupilData.id, newUpn)

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(newUpn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.upn).toBe(newUpn)
  })

  test('it sets the isEdited flag when the date of birth changes', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    const newDob = moment('2023-01-01')
    await pupilTestService.updateDob(dbPupilData.id, newDob)

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.dateOfBirth.format('YYYY-MM-DD')).toBe(newDob.format('YYYY-MM-DD'))
  })

  test('it does not set the isEdited flag when the forename alias is changed', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateForenameAlias(dbPupilData.id, 'first alias')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.isEdited).toBe(false) // does NOT get set!
    expect(newPupilData.foreNameAlias).toBe('first alias')
  })

  test('it does not set the isEdited flag when the lastname alias is changed', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test - confirm the isEdited flag state
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change, that will cause the functionality (in this case the pupil trigger for update)
    await pupilTestService.updateLastnameAlias(dbPupilData.id, 'last alias')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.isEdited).toBe(false) // does NOT get set!
    expect(newPupilData.lastNameAlias).toBe('last alias')
  })

  test('it updates the updatedAt timestamp when edited ', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    const ts1 = dbPupilData.updatedAt

    // Apply any change
    await pupilTestService.updateLastnameAlias(dbPupilData.id, 'last alias')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.updatedAt.valueOf()).toBeGreaterThan(ts1.valueOf()) // compare in milliseconds from moment objects.
    expect(newPupilData.lastNameAlias).toBe('last alias')
  })

  test('updating an already-edited pupil record keeps the isEdited field set to true', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test
    expect(dbPupilData.isEdited).toBe(false)

    // Apply any change
    await pupilTestService.updateLastname(dbPupilData.id, 'Newman')

    // Check the isEdited flag is now applied.  As it is a trigger it will run on changes from the admin app, and even DB Admin.
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.isEdited).toBe(true)
    expect(newPupilData.lastName).toBe('Newman')

    // update again
    await pupilTestService.updateForename(newPupilData.id, 'Zwei')
    const updatedPupilData = await pupilTestService.findPupilByUPN(newPupilData.upn)

    // final checks
    expect(updatedPupilData.isEdited).toBe(true)
    expect(updatedPupilData.foreName).toBe('Zwei')
  })

  test('updating an already-edited pupil record keeps the isEdited field set to false (it was already false)e', async () => {
    // setup - add a fresh pupil
    const pupilData = fakePupilData()
    await pupilAddService.addPupil(pupilData, schoolId, userId)
    const dbPupilData = await pupilTestService.findPupilByUPN(pupilData.upn)

    // Pre-test
    expect(dbPupilData.isEdited).toBe(false)

    // Apply a change that does not set the isEdited flag to true
    await pupilTestService.updateForenameAlias(dbPupilData.id, 'first alias')

    // Review the results
    await pupilTestService.updateForenameAlias(dbPupilData.id, 'first alias')
    const newPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(newPupilData.isEdited).toBe(false)
    expect(newPupilData.foreNameAlias).toBe('first alias')

    // Re-apply a change (that does not set the isEdited flag to true
    await pupilTestService.updateForenameAlias(dbPupilData.id, 'updated alias')

    // review
    const updatedPupilData = await pupilTestService.findPupilByUPN(dbPupilData.upn)
    expect(updatedPupilData.isEdited).toBe(false)
    expect(updatedPupilData.foreNameAlias).toBe('updated alias')
  })
})
