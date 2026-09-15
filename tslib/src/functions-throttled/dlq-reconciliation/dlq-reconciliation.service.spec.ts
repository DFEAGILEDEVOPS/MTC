import { DlqReconciliationService, type IDlqReconciliationResult } from './dlq-reconciliation.service'

describe('DlqReconciliationService', () => {
  let sut: DlqReconciliationService
  let dataService: {
    getCheckSyncStatus: jest.Mock
  }

  beforeEach(() => {
    dataService = {
      getCheckSyncStatus: jest.fn()
    }
    sut = new DlqReconciliationService(undefined, dataService as any)
  })

  test('counts messages as resolved when the database shows resultsSynchronised = 1', async () => {
    const messages = [
      { body: { markedCheck: { checkCode: '11111111-1111-1111-1111-111111111111' } } },
      { body: { markedCheck: { checkCode: '22222222-2222-2222-2222-222222222222' } } }
    ]
    dataService.getCheckSyncStatus.mockResolvedValueOnce({ resultsSynchronised: 1 })
    dataService.getCheckSyncStatus.mockResolvedValueOnce({ resultsSynchronised: 0 })

    const actual = await sut.reconcileMessages(messages as any)

    expect(actual).toMatchObject<Partial<IDlqReconciliationResult>>({
      total: 2,
      resolved: 1,
      unresolved: 1
    })
  })

  test('treats malformed content as unresolved and resolves only database-confirmed matches', async () => {
    const messages = [
      { body: 'not-json' },
      { body: { markedCheck: { checkCode: '33333333-3333-3333-3333-333333333333' } } },
      { body: { markedCheck: { checkCode: '44444444-4444-4444-4444-444444444444' } } }
    ]
    dataService.getCheckSyncStatus.mockResolvedValueOnce({ resultsSynchronised: 1 })
    dataService.getCheckSyncStatus.mockResolvedValueOnce({ resultsSynchronised: 0 })

    const actual = await sut.reconcileMessages(messages as any)

    expect(actual).toMatchObject<Partial<IDlqReconciliationResult>>({
      total: 3,
      resolved: 1,
      unresolved: 2
    })
  })

  test('returns zero counts when there are no messages to process', async () => {
    const actual = await sut.reconcileMessages([])

    expect(actual).toMatchObject<Partial<IDlqReconciliationResult>>({
      total: 0,
      resolved: 0,
      unresolved: 0
    })
  })
})
