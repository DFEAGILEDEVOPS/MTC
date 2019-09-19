'use strict'

/* global describe, it, expect */

const removeDuplicates = require('../../service/detections/remove-duplicate-anomaly-reports')

describe('#removeDuplicates', () => {
  it('removes duplicate reports for the same question number', () => {
    const tests = [{
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.740Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    },
    {
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.853Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    }]
    const deduped = removeDuplicates(tests)
    expect(deduped.length).toBe(1)
    expect(deduped[0]['Tested Value']).toBe('2019-06-10T08:20:31.740Z') // second report is removed
  })

  it('does not remove reports just because the question number is the same', () => {
    const tests = [{
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.740Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    },
    {
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Some other type of Message',
      'Tested Value': '2019-06-10T08:20:31.853Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    }]
    const deduped = removeDuplicates(tests)
    expect(deduped).toEqual(tests) // nothing gets removed here
  })

  it('does not remove reports just because the message is the same', () => {
    const tests = [{
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.740Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    },
    {
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.853Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q2'
    }]
    const deduped = removeDuplicates(tests)
    expect(deduped).toEqual(tests) // nothing gets removed here
  })

  it('does not remove reports just because a property is the empty string', () => {
    const tests = [{
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.740Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': 'Q1'
    },
    {
      CheckCode: undefined,
      Date: '',
      Mark: 'undefined out of undefined',
      Device: 'Other ',
      Agent: 'Other 0.0.0 / Other 0.0.0',
      Message: 'Input received before Question shown',
      'Tested Value': '2019-06-10T08:20:31.853Z',
      'Expected Value': '>= 2019-06-10T08:20:31.960Z',
      'Question number': ''
    }]
    const deduped = removeDuplicates(tests)
    expect(deduped).toEqual(tests) // nothing gets removed here
  })
})
