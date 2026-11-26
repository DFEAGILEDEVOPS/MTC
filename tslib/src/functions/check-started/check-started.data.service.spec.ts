import { CheckStartedDataService } from './check-started.data.service.js'

describe('CheckStartedDataService', () => {
  test.each([
    [true, true],
    [false, false]
  ])('reports acknowledged start state %s as %s', async (hasStarted, expected) => {
    const sqlService = {
      query: jest.fn().mockResolvedValue([{ hasStarted }]),
      modify: jest.fn()
    }
    const service = new CheckStartedDataService(sqlService)

    await expect(service.hasStarted('1111-2222-3333-4444')).resolves.toBe(expected)
    expect(sqlService.query).toHaveBeenCalledWith(
      expect.stringContaining('checkStartAcknowledgement'),
      expect.arrayContaining([expect.objectContaining({ name: 'checkCode', value: '1111-2222-3333-4444' })])
    )
  })

  test('rejects an invalid lookup result', async () => {
    const service = new CheckStartedDataService({ query: jest.fn().mockResolvedValue([]), modify: jest.fn() })
    await expect(service.hasStarted('check-code')).rejects.toThrow('Check start lookup returned an invalid result')
  })

  test('returns the acknowledgement decision from the transactional query', async () => {
    const sqlService = {
      query: jest.fn().mockResolvedValue([{ approved: true }]),
      modify: jest.fn()
    }
    const service = new CheckStartedDataService(sqlService)
    await expect(service.acknowledgeStart('check-code', 'attempt-id')).resolves.toBe(true)
    expect(sqlService.query).toHaveBeenCalledWith(
      expect.stringContaining('WITH (UPDLOCK, HOLDLOCK)'),
      expect.arrayContaining([
        expect.objectContaining({ name: 'checkCode', value: 'check-code' }),
        expect.objectContaining({ name: 'attemptId', value: 'attempt-id' })
      ])
    )
  })

  test('checks the switch and matching check and attempt in one eligibility query', async () => {
    const sqlService = { query: jest.fn().mockResolvedValue([{ allowed: true }]), modify: jest.fn() }
    const service = new CheckStartedDataService(sqlService)
    await expect(service.isSubmissionAllowed('check-code', 'attempt-id')).resolves.toBe(true)
    const [sql, params] = sqlService.query.mock.calls[0]
    expect(sql).toContain('e.[isEnabled] = 0')
    expect(sql).toContain('c.[checkCode] = @checkCode AND a.[attemptId] = @attemptId')
    expect(params).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'checkCode', value: 'check-code' }),
      expect.objectContaining({ name: 'attemptId', value: 'attempt-id' })
    ]))
  })

  test('rejects a missing switch state during submission eligibility lookup', async () => {
    const service = new CheckStartedDataService({ query: jest.fn().mockResolvedValue([]), modify: jest.fn() })
    await expect(service.isSubmissionAllowed(null, null)).rejects.toThrow('Check submission eligibility returned an invalid result')
  })
})
