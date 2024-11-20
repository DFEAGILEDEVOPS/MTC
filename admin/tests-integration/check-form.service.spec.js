'use strict'

/**
 * @file Integration Tests for Check Form Service
 */

// These tests take a long time, so they are usually skipped unless we change the implementation
jest.setTimeout(120000)

const fs = require('fs')
const moment = require('moment')

const checkFormService = require('../services/check-form.service')

describe.skip('check-form.service', () => {
  const availableForms = []
  const seenForms = []

  describe('in-memory tests of check-form.service.allocateCheckForm', () => {
    beforeAll(async () => {
      for (let i = 1; i < 10; i++) {
        const form = {
          id: i,
          name: `Integration Test Form ${i}`,
          isDeleted: false,
          formData: []
        }
        availableForms.push(form)
      }
    })

    test('has enough forms to complete a random sample', () => {
      expect(availableForms).toHaveLength(9)
    })

    test('allocates 20 check forms equally when there are no seen forms', async () => {
      const formsAllocated = []
      const runs = 628718
      for (let i = 0; i < runs; i++) {
        const f = await checkFormService.allocateCheckForm(availableForms, seenForms)
        formsAllocated.push(f)
      }
      // Expect to have a form produced for every iteration
      expect(formsAllocated).toHaveLength(runs)

      // Count the frequencies of the forms allocated
      const count = countForm(formsAllocated, availableForms)

      writeCsvFile(count)

      availableForms.forEach(f => {
        expect({}.hasOwnProperty.call(count, f.id)).toBeTruthy()
      })
    })
  })
})

function countForm (formsAllocated, availableForms) {
  const count = {}
  for (let i = 0; i < formsAllocated.length; i++) {
    const formId = formsAllocated[i].id
    count[formId] = count[formId] ? count[formId] + 1 : 1
  }

  // Add in any forms that had zero allocations
  availableForms.forEach(f => {
    if (!{}.hasOwnProperty.call(count, f.id)) {
      count[f.id] = 0
    }
  })
  return count
}

function writeCsvFile (data) {
  const filename = 'form-allocation-simulation-' + moment().format('YYYY-MM-DD.hhmmss') + '.csv'
  const stream = fs.createWriteStream(filename)
  stream.write('Form ID,Frequency\n')
  Object.keys(data).sort((a, b) => a - b).forEach(i => {
    stream.write(`${i},${data[i]}\n`)
  })
  stream.end()
}
