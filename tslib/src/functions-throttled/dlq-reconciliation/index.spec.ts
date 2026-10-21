import { app, type HttpRequest, type InvocationContext } from '@azure/functions'
import { ServiceBusAdministrationClient, ServiceBusClient } from '@azure/service-bus'
import { DlqReconciliationService } from './dlq-reconciliation.service'
import { DlqReconciliationDataService } from './dlq-reconciliation.data.service'
import { dlqReconciliationHttp, runDlqReconciliation } from './index'

jest.mock('@azure/functions', () => ({ app: { http: jest.fn(), timer: jest.fn() } }))
jest.mock('@azure/service-bus', () => ({ ServiceBusClient: jest.fn(), ServiceBusAdministrationClient: jest.fn() }))
jest.mock('../../config', () => ({ __esModule: true, default: { ServiceBus: { ConnectionString: 'test-connection' } } }))
jest.mock('./dlq-reconciliation.service', () => ({ DlqReconciliationService: jest.fn() }))
jest.mock('./dlq-reconciliation.data.service', () => ({ DlqReconciliationDataService: jest.fn() }))

describe('DLQ reconciliation HTTP reporting', () => {
  let getQueueRuntimeProperties: jest.Mock
  let reconcile: jest.Mock
  let context: InvocationContext
  let closeReceiver: jest.Mock
  let closeClient: jest.Mock
  let data: Record<string, jest.Mock>
  const runId = 'f3f36f0e-ec74-4ef3-a65f-a3fa9d80b376'

  function request (body: unknown, method = 'POST', query = ''): HttpRequest {
    return { method, query: new URLSearchParams(query), json: async () => body } as HttpRequest
  }

  beforeEach(() => {
    jest.clearAllMocks()
    getQueueRuntimeProperties = jest.fn().mockResolvedValue({ deadLetterMessageCount: 2 })
    reconcile = jest.fn().mockResolvedValue({ status: 'Completed', message: 'Complete' })
    closeReceiver = jest.fn().mockResolvedValue(undefined)
    closeClient = jest.fn().mockResolvedValue(undefined)
    context = { warn: jest.fn(), error: jest.fn(), log: jest.fn() } as unknown as InvocationContext
    data = {
      createRun: jest.fn().mockResolvedValue(undefined),
      claimRun: jest.fn().mockResolvedValue({ runId, mode: 'preview' }),
      getRun: jest.fn().mockResolvedValue({ runId, mode: 'preview', status: 'Completed', queueName: 'check-submission', eligibleCount: 2, inventoryCount: 2 }),
      getInventory: jest.fn().mockResolvedValue([]),
      getItems: jest.fn().mockResolvedValue([{ messageId: 'first' }, { messageId: 'second' }]),
      listRuns: jest.fn().mockResolvedValue([]),
      finishRun: jest.fn().mockResolvedValue(undefined)
    }
    jest.mocked(DlqReconciliationDataService).mockImplementation(() => data as unknown as DlqReconciliationDataService)
    jest.mocked(ServiceBusAdministrationClient).mockImplementation(() => ({ getQueueRuntimeProperties }) as unknown as ServiceBusAdministrationClient)
    jest.mocked(ServiceBusClient).mockImplementation(() => ({
      createReceiver: jest.fn().mockReturnValue({ close: closeReceiver }),
      close: closeClient
    }) as unknown as ServiceBusClient)
    jest.mocked(DlqReconciliationService).mockImplementation(() => ({ preview: reconcile, cleanup: reconcile }) as unknown as DlqReconciliationService)
  })

  test('executes the requested preview directly without a timer', async () => {
    const response = await dlqReconciliationHttp(request({ mode: 'preview', requestedBy: '123' }), context)
    expect(response.status).toBe(200)
    expect(response.jsonBody).toMatchObject({ queueName: 'check-submission' })
    expect(data.createRun).toHaveBeenCalledWith(expect.any(String), 'preview', '123', undefined)
    expect(data.claimRun).toHaveBeenCalledWith(data.createRun.mock.calls[0][0])
    expect(reconcile).toHaveBeenCalledTimes(1)
    expect(app.timer).not.toHaveBeenCalled()
  })

  test('returns paged IDs for a run', async () => {
    const response = await dlqReconciliationHttp(request(null, 'GET', `runId=${runId}&page=1`), context)
    expect(response.jsonBody).toMatchObject({ items: [{ messageId: 'first' }, { messageId: 'second' }], totalPages: 1 })
  })

  test('uses only the check-submission DLQ in a manual run', async () => {
    await runDlqReconciliation(runId, context)
    expect(getQueueRuntimeProperties).toHaveBeenCalledWith('check-submission')
    expect(jest.mocked(ServiceBusClient).mock.results[0].value.createReceiver).toHaveBeenCalledWith('check-submission', expect.objectContaining({ subQueueType: 'deadLetter', receiveMode: 'peekLock' }))
    expect(closeReceiver).toHaveBeenCalledTimes(1)
    expect(closeClient).toHaveBeenCalledTimes(1)
  })

  test('does not allow cleanup without a completed preview', async () => {
    const response = await dlqReconciliationHttp(request({ mode: 'cleanup', requestedBy: '123' }), context)
    expect(response.status).toBe(400)
    expect(data.createRun).not.toHaveBeenCalled()
  })

  test('reports unavailable instead of zero if queue statistics cannot be read', async () => {
    getQueueRuntimeProperties.mockRejectedValue(new Error('Manage permission required'))
    await runDlqReconciliation(runId, context)
    expect(data.finishRun).toHaveBeenCalledWith(runId, 'Completed', 'Complete', null, null)
    expect(context.warn).toHaveBeenCalledWith('dlq-reconciliation: unable to read the DLQ count', expect.any(Error))
  })

  test('links an explicit cleanup request to the completed preview', async () => {
    data.claimRun.mockResolvedValue({ runId, mode: 'cleanup', previewRunId: runId })
    expect((await dlqReconciliationHttp(request({ mode: 'cleanup', requestedBy: '123', previewRunId: runId }), context)).status).toBe(200)
    expect(data.createRun).toHaveBeenCalledWith(expect.any(String), 'cleanup', '123', runId)
  })

  test('rejects concurrent runs', async () => {
    data.createRun.mockRejectedValue({ number: 2601 })
    expect((await dlqReconciliationHttp(request({ mode: 'preview', requestedBy: '123' }), context)).status).toBe(409)
  })

  test.each(['runId=bad', `runId=${runId}&page=-1`, `runId=${runId}&page=1.5`])('rejects invalid query: %s', async query => {
    expect((await dlqReconciliationHttp(request(null, 'GET', query), context)).status).toBe(400)
  })

  test('does not process a different run when the requested run cannot be claimed', async () => {
    data.claimRun.mockResolvedValue(undefined)
    await expect(runDlqReconciliation(runId, context)).rejects.toThrow('could not be claimed')
    expect(data.claimRun).toHaveBeenCalledWith(runId)
    expect(ServiceBusClient).not.toHaveBeenCalled()
    expect(data.createRun).not.toHaveBeenCalled()
  })

  test('marks interrupted workers without reporting successful removal', async () => {
    reconcile.mockRejectedValue(new Error('Audit unavailable'))
    await runDlqReconciliation(runId, context)
    expect(data.finishRun).toHaveBeenCalledWith(runId, 'Interrupted', expect.any(String), 2, null)
    expect(closeReceiver).toHaveBeenCalledTimes(1)
    expect(closeClient).toHaveBeenCalledTimes(1)
  })

  test('reports missing migrations before receiving any messages', async () => {
    data.createRun.mockRejectedValue({ number: 208 })
    const response = await dlqReconciliationHttp(request({ mode: 'preview', requestedBy: '123' }), context)
    expect(response.status).toBe(503)
    expect(response.body).toContain('database audit migrations')
    expect(ServiceBusClient).not.toHaveBeenCalled()
  })

  test('explains missing tables when loading history', async () => {
    data.listRuns.mockRejectedValue({ number: 208 })
    const response = await dlqReconciliationHttp(request(null, 'GET'), context)
    expect(response.status).toBe(503)
    expect(response.body).toContain('20261019120000')
  })
})