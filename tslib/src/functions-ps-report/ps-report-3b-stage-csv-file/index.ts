import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { type IPsychometricReportLine } from '../ps-report-2-pupil-data/transformer-models'
import { jsonReviver } from '../../common/json-reviver'
import { PsReportStagingDataService } from './ps-report-staging.data.service'
import { CsvTransformer } from './csv-transformer'
import type { PsReportStagingStartMessage, PsReportStagingCompleteMessage, PsReportBatchMessage } from '../common/ps-report-service-bus-messages'
const RA = require('ramda-adjunct')

const functionName = 'ps-report-3b-stage-csv-file'
let logPrefix = functionName
const receiveQueueName = 'ps-report-export'
const sleep = async (ms: number): Promise<void> => { return new Promise((resolve) => setTimeout(resolve, ms)) }
let emptyPollTime: undefined | number
const getEpoch = (): number => { const dt = +new Date(); return Math.floor(dt / 1000) }
let psReportStagingDataService: PsReportStagingDataService

const stagingCompleteQueueOutput = output.serviceBusQueue({
  queueName: 'ps-report-staging-complete',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING'
})

app.serviceBusQueue(functionName, {
  queueName: 'ps-report-staging-start',
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  handler: PsReportStageCsvFile,
  extraOutputs: [stagingCompleteQueueOutput]
})

/**
 * The function is running as a singleton, and the receiver is therefore exclusive
 * we do not expect another receive operation to be in progress. if the message
 * is abandoned 10 times (the current 'max delivery count') it will be
 * put on the dead letter queue automatically.
*/
export async function PsReportStageCsvFile (triggerInput: unknown, context: InvocationContext): Promise<void> {
  logPrefix = `${functionName}:${context.invocationId}`
  context.log(`${logPrefix}: starting`)
  const start = performance.now()
  const incomingMessage = triggerInput as PsReportStagingStartMessage
  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${logPrefix}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver
  const containerName = 'ps-report-bulk-upload'
  const blobName = incomingMessage.filename

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log(`${logPrefix}: connecting to service bus...`)
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver(receiveQueueName, {
      receiveMode: 'peekLock'
    })
    context.log(`${logPrefix}: connected to service bus instance ${busClient.fullyQualifiedNamespace}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${logPrefix}: unable to connect to service bus at this time: ${errorMessage}`)
    throw error
  }

  // Create the data service to upload to a blob file
  try {
    psReportStagingDataService = new PsReportStagingDataService(context, containerName, blobName)
    // At this point the file has not yet been created, so it needs to be created. An existing file will be
    // overwritten (erasing old data).
    await psReportStagingDataService.createAppendBlock()
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.error(`${logPrefix}: ${errorMessage}`)
    throw error
  }

  let done = false
  let batchIndex = 0

  while (!done) {
    context.log(`${logPrefix}: starting batch ${batchIndex + 1}`)
    const messageBatch = await receiver.receiveMessages(config.PsReport.StagingFile.ReadMessagesPerBatch)
    if (RA.isNilOrEmpty(messageBatch) === true) {
      context.log(`${logPrefix}: no messages to process`)
      if (emptyPollTime === undefined) {
        context.log(`${logPrefix}: Setting flag to mark the time since no messages were found.`)
        emptyPollTime = getEpoch()
      }
      const nowEpoch = getEpoch()
      const timeSinceLastMessage = nowEpoch - emptyPollTime
      context.log(`${logPrefix}: nowEpoch: ${nowEpoch} emptyPollTime: ${emptyPollTime} timeSinceLastMessage: ${timeSinceLastMessage} target wait time is ${config.PsReport.StagingFile.WaitTimeToTriggerStagingComplete}`)
      if (timeSinceLastMessage >= config.PsReport.StagingFile.WaitTimeToTriggerStagingComplete) {
        context.log(`${logPrefix}: exiting (and sending output binding message) as no new messages in ${config.PsReport.StagingFile.WaitTimeToTriggerStagingComplete} seconds.`)
        done = true
        // This message should be delivered once - duplicatePrevention is on the sb queue, but outputbindings do not allow a messageId to be set.
        // ToDo: move away from output bindinds and send this message using the sbClient instead.
        const completeMessage: PsReportStagingCompleteMessage = {
          filename: incomingMessage.filename,
          jobUuid: incomingMessage.jobUuid
        }
        context.extraOutputs.set(stagingCompleteQueueOutput, [completeMessage])
        await disconnect()
        return finish(start, context)
      } else {
        // context.log(`${logPrefix}: waiting for messages...`)
        await sleep(config.PsReport.StagingFile.PollInterval) // wait n milliseconds before polling again. Default is 10.
      }
    } else {
      // Messages were received
      // so, 1st reset the timer, as it may have been set previously
      emptyPollTime = undefined
      // and process the messages
      context.log(`${logPrefix}: received batch of ${messageBatch.length} messages`)
      await process(context, messageBatch, receiver)
    }

    batchIndex += 1
  } // end while

  await disconnect()
  finish(start, context)
}

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${logPrefix}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: InvocationContext): Promise<void> {
  // the sql updates are committed, complete the messages.
  // if any completes fail, just abandon.
  // the sql updates are idempotent and as such replaying a message
  // will not have an adverse effect.
  context.log(`${logPrefix}: batch processed successfully, completing all messages in batch`)
  for (const msg of messageBatch) {
    try {
      await receiver.completeMessage(msg)
    } catch (error) {
      try {
        await receiver.abandonMessage(msg)
      } catch {
        let errorMessage = 'unknown error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        context.error(`${logPrefix}: unable to abandon message:${errorMessage}`)
        // do nothing.
        // the lock will expire and message reprocessed at a later time
      }
    }
  }
}

async function abandonMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: InvocationContext): Promise<void> {
  for (const msg of messageBatch) {
    try {
      await receiver.abandonMessage(msg)
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      context.error(`${logPrefix}: unable to abandon message:${errorMessage}`)
    }
  }
}

async function process (context: InvocationContext, messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver): Promise<void> {
  try {
    // Extract batched pupil results from messages and flatten them
    const psReportData: IPsychometricReportLine[] = []
    let batchCount = 0

    for (const message of messageBatch) {
      const batchMessage = reviveBatch(message.body as PsReportBatchMessage)
      psReportData.push(...batchMessage.batch)
      batchCount += 1
      context.trace(`${logPrefix}: received batch message ${batchMessage.batchNumber}/${batchMessage.totalBatches} with ${batchMessage.batch.length} pupils from school ${batchMessage.schoolName}`)
    }

    context.log(`${logPrefix}: received ${batchCount} batch messages containing total ${psReportData.length} pupils for processing`)
    
    const csvTransformer = new CsvTransformer(context, psReportData)
    const linesOfData = csvTransformer.transform()
    await psReportStagingDataService.appendDataToBlob(linesOfData)
    await completeMessages(messageBatch, receiver, context)
  } catch (error) {
    // transaction failed, abandon messages...
    context.error(`${logPrefix}: error processing batch: ${error instanceof Error ? error.message : 'unknown error'}`)
    await abandonMessages(messageBatch, receiver, context)
  }
}

/**
 * JSON reviver for batched messages containing multiple pupil results
 */
function reviveBatch (message: PsReportBatchMessage): PsReportBatchMessage {
  return JSON.parse(JSON.stringify(message), jsonReviver) as PsReportBatchMessage
}
