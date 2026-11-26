import { CheckStartedDataService } from './check-started.data.service.js'

describe('CheckStartedDataService', () => {
  test.each([
    [true, true],
    [false, false],
    [undefined, false]
  ])('reports startedAt state %s as %s', async (hasStarted, expected) => {
    const sqlService = {
      query: jest.fn().mockResolvedValue(hasStarted === undefined ? [] : [{ hasStarted }]),
      modify: jest.fn()
    }
    const service = new CheckStartedDataService(sqlService)

    await expect(service.hasStarted('1111-2222-3333-4444')).resolves.toBe(expected)
    expect(sqlService.query).toHaveBeenCalledWith(
      expect.stringContaining('startedAt'),
      expect.arrayContaining([expect.objectContaining({ name: 'checkCode', value: '1111-2222-3333-4444' })])
    )
  })
})
