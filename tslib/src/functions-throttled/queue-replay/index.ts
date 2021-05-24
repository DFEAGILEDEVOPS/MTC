import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const functionName = 'queue-replay'

/**
 * Incoming message is just the name and UUID of the school to process
 * The name is used for logging
 * The UUID is used to fetch all pupils for the school
 */
interface IQueueReplayRequest {
  queueName: string
  maxMessages: number
  requestedBy: string
  requestedAt: Date
}

interface IQueueReplayAuditRecord {
  queueName: string
  maxMessages: number
  requestedBy: string
  requestedAt: Date
  messagesProcessed: number
}

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, replayRequest: IQueueReplayRequest): Promise<void> {
  const start = performance.now()
  context.log.verbose(`${functionName}: called for queue ${replayRequest.queueName}`)
  let messagesProcessed = 0
  // TODO replay
  const auditRecord: IQueueReplayAuditRecord = {
    maxMessages: replayRequest.maxMessages,
    messagesProcessed: messagesProcessed,
    queueName: replayRequest.queueName,
    requestedAt: replayRequest.requestedAt,
    requestedBy: replayRequest.requestedBy
  }
  context.bindings.queueReplayAuditTable = auditRecord
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed ${auditRecord.messagesProcessed} pupils, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
