import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { ServiceBusClient, ServiceBusAdministrationClient } from '@azure/service-bus'
import { randomUUID } from 'node:crypto'
import { validate as isUuid } from 'uuid'
import config from '../../config'
import { DlqReconciliationService } from './dlq-reconciliation.service'
import { DlqReconciliationDataService } from './dlq-reconciliation.data.service'
import { queueName } from './models'

const functionName = 'dlq-reconciliation'

app.http(functionName, {
  methods: ['GET', 'POST'],
  authLevel: 'function',
  handler: dlqReconciliationHttp
})

async function queueCount (connectionString: string, context: InvocationContext): Promise<number | null> {
  try {
    const administrationClient = new ServiceBusAdministrationClient(connectionString)
    return (await administrationClient.getQueueRuntimeProperties(queueName)).deadLetterMessageCount
  } catch (error) {
    context.warn(`${functionName}: unable to read the DLQ count`, error)
    return null
  }
}

export async function dlqReconciliationHttp (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const data = new DlqReconciliationDataService()
  try {
    if (request.method === 'GET') {
      const runId = request.query.get('runId')
      if (runId === null) return { status: 200, jsonBody: { runs: await data.listRuns() } }
      const page = Number(request.query.get('page') ?? 1)
      if (!isUuid(runId) || !Number.isSafeInteger(page) || page < 1 || page > 10000) {
        return { status: 400, body: 'Invalid run ID or page' }
      }
      const run = await data.getRun(runId)
      if (run === undefined) return { status: 404, body: 'Run not found' }
      return { status: 200, jsonBody: { run, items: await data.getItems(runId, page), page, totalPages: Math.max(1, Math.ceil(run.inventoryCount / 50)) } }
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return { status: 400, body: 'A JSON request body is required' }
    }
    if (typeof body !== 'object' || body === null || !('mode' in body) ||
      (body.mode !== 'preview' && body.mode !== 'cleanup') || !('requestedBy' in body) ||
      typeof body.requestedBy !== 'string' || body.requestedBy.trim().length === 0 || body.requestedBy.length > 128) {
      return { status: 400, body: 'A valid mode and operator are required' }
    }
    let previewRunId: string | undefined
    if (body.mode === 'cleanup') {
      if (!('previewRunId' in body) || typeof body.previewRunId !== 'string' || !isUuid(body.previewRunId)) {
        return { status: 400, body: 'Cleanup requires a completed preview' }
      }
      const preview = await data.getRun(body.previewRunId)
      if (preview?.mode !== 'preview' || preview.queueName !== queueName || preview.status !== 'Completed' || preview.eligibleCount === 0) {
        return { status: 400, body: 'Cleanup requires a completed preview with eligible messages' }
      }
      previewRunId = body.previewRunId
    }
    const runId = randomUUID()
    await data.createRun(runId, body.mode, body.requestedBy.trim(), previewRunId)
    await runDlqReconciliation(runId, context)
    return { status: 200, jsonBody: { runId, queueName } }
  } catch (error) {
    const code = (error as { number?: number }).number
    if (code === 208) return { status: 503, body: 'DLQ reconciliation requires the database audit migrations. Apply migrations 20261019120000 and 20261019120001 before running it.' }
    if (code === 2601 || code === 2627) return { status: 409, body: 'Another reconciliation run is already active for this queue' }
    context.error(`${functionName}: reconciliation failed`, error)
    return { status: 500, body: 'DLQ reconciliation failed. Check the function logs before retrying.' }
  }
}

export async function runDlqReconciliation (runId: string, context: InvocationContext): Promise<void> {
  const data = new DlqReconciliationDataService()
  const run = await data.claimRun(runId)
  if (run === undefined) throw new Error('Requested reconciliation run could not be claimed')
  let before: number | null = null
  let after: number | null = null
  try {
    const connectionString = config.ServiceBus.ConnectionString
    if (connectionString === undefined || connectionString.length === 0) throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING is required')
    before = await queueCount(connectionString, context)
    const client = new ServiceBusClient(connectionString)
    let result: { status: string, message: string }
    try {
      const receiver = client.createReceiver(queueName, {
        subQueueType: 'deadLetter', receiveMode: 'peekLock', maxAutoLockRenewalDurationInMs: 300000
      })
      try {
        const service = new DlqReconciliationService(undefined, data)
        if (run.mode === 'cleanup') {
          if (run.previewRunId === null) throw new Error('Cleanup run has no preview')
          const preview = await data.getRun(run.previewRunId)
          if (preview?.mode !== 'preview' || preview.status !== 'Completed') throw new Error('Preview is not complete')
          result = await service.cleanup(receiver, run.runId, await data.getInventory(run.previewRunId))
        } else {
          result = await service.preview(receiver, run.runId)
        }
      } finally {
        await receiver.close()
      }
    } finally {
      await client.close()
    }
    after = await queueCount(connectionString, context)
    await data.finishRun(run.runId, result.status, result.message, before, after)
    context.log(`${functionName}: run ${run.runId}: ${result.message}`)
  } catch (error) {
    context.error(`${functionName}: run ${run.runId} interrupted`, error)
    await data.finishRun(run.runId, 'Interrupted', 'Worker failed. Review pending or unconfirmed outcomes before retrying.', before, after)
  }
}