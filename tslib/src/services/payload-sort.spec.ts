import { payloadSort as sut } from './payload-sort'

describe('payloadSort', () => {
  test('it sorts on clientTimestamp', () => {
    const items = [
      { clientTimestamp: '2022-10-17T11:01:59.837Z' },
      { clientTimestamp: '2022-10-17T11:01:40.324Z' }
    ]
    const sorted = sut(items)
    expect(sorted[0].clientTimestamp).toBe('2022-10-17T11:01:40.324Z')
  })

  test('it sorts on the monotonic sequence number if the timestamps are equal', () => {
    const items = [
      { clientTimestamp: '2022-10-17T11:01:00.000', monotonicTime: { sequenceNumber: 2 } },
      { clientTimestamp: '2022-10-17T11:01:00.000', monotonicTime: { sequenceNumber: 1 } }
    ]
    const sorted = sut(items)
    expect(sorted[0]?.monotonicTime?.sequenceNumber).toBe(1)
  })

  test('it sorts on the data monotonic sequence number if the timestamps are equal', () => {
    const items = [
      { clientTimestamp: '2022-10-17T11:01:00.000', data: { monotonicTime: { sequenceNumber: 2 } } },
      { clientTimestamp: '2022-10-17T11:01:00.000', data: { monotonicTime: { sequenceNumber: 1 } } }
    ]
    const sorted = sut(items)
    expect(sorted[0]?.data?.monotonicTime?.sequenceNumber).toBe(1)
  })

  test('the monotonicTime property is optional', () => {
    const items = [
      { clientTimestamp: '2022-10-17T11:01:59.837Z' },
      { clientTimestamp: '2022-10-17T11:01:59.837Z' },
      { clientTimestamp: '2022-10-17T11:01:40.324Z' }
    ]
    const sorted = sut(items)
    expect(sorted[0].clientTimestamp).toBe('2022-10-17T11:01:40.324Z')
    expect(sorted[1].clientTimestamp).toBe('2022-10-17T11:01:59.837Z')
    expect(sorted[2].clientTimestamp).toBe('2022-10-17T11:01:59.837Z')
  })

  test('the sort does not mutate the parameter', () => {
    const items = [
      { clientTimestamp: '2022-10-17T11:01:59.837Z' },
      { clientTimestamp: '2022-10-17T11:01:40.324Z' }
    ]
    const sorted = sut(items)
    expect(sorted).not.toBe(items)
    expect(items[0].clientTimestamp).toBe('2022-10-17T11:01:59.837Z')
  })
})
