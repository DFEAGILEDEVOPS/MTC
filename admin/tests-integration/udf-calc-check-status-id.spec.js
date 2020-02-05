'use strict'

/* global describe it expect beforeAll afterAll */
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}
const sql = require('../services/data-access/sql.service')
const createCheck = require('./test-support/create-check')

describe('DB function: udfCalcCheckStatusID', () => {
  beforeAll(async () => {
    await sql.initPool()
  })

  afterAll(async () => {
    await sql.drainPool()
  })

  function createQuery (checkId) {
    return `SELECT code from [mtc_admin].[checkStatus] where id = dbo.ufnCalcCheckStatusID(${Number(checkId)})`
  }

  describe('live checks', () => {
    it('can identify a NEW check', async () => {
      const id = await createCheck('NEW', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW')
    })

    it('can identify a COLLECTED check', async () => {
      const id = await createCheck('COL', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('COL') // COLLECTED
    })

    it('can identify a COMPLETED check', async () => {
      const id = await createCheck('CMP', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('CMP') // COMPLETED
    })

    it('can identify an EXPIRED check with a pin', async () => {
      const id = await createCheck('EXP1', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW')
    })

    it('can identify a EXPIRED check without a pin', async () => {
      const id = await createCheck('EXP2', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW')
    })

    it('can identify a NOT RECEIVED check', async () => {
      const id = await createCheck('NTR1', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NTR') // NOT RECEIVED
    })

    it('can identify a NOT RECEIVED check where the startedAt field is not set', async () => {
      const id = await createCheck('NTR2', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NTR') // NOT RECEIVED
    })
  })

  describe('try it out checks', () => {
    it('can identify a NEW check', async () => {
      const id = await createCheck('NEW', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW')
    })

    it('can identify a COLLECTED check', async () => {
      const id = await createCheck('COL', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('COL') // COLLECTED
    })

    it('can identify an EXPIRED check with a pin', async () => {
      const id = await createCheck('EXP1', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW') // Status is NEW, but PIN has expired
    })

    it('can identify an EXPIRED check without a pin', async () => {
      const id = await createCheck('EXP2', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('NEW') // Status is NEW, pin has expired and been deleted
    })

    it('does not class a try it out check as not received', async () => {
      const id = await createCheck('NTR1', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('COL') // COLLECTED
    })

    it('can identify a check that failed processing', async () => {
      const id = await createCheck('ERR', 1)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('ERR')
    })

    // Note: VOID checks cannot be determined as the status is only thing that determines this
    // A check could be voided from any state
  })

  describe('unusual conditions:', () => {
    it('does not class a try it out check as complete', async () => {
      const id = await createCheck('CMP', 0)
      const res = await sql.query(createQuery(id))
      const checkStatusCode = res[0].code
      expect(checkStatusCode).toBe('COL') // COLLECTED
    })
  })
})
