import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IFunctionTimer } from '../../azure/functions'
import config from '../../config'
import * as sb from '@azure/service-bus'
import * as RA from 'ramda-adjunct'
import { LogService } from './log.service'
import moment from 'moment'

const functionName = 'ps-report-log-generator'
const queueName = 'ps-report-log'

const funcImplementation: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
  if (timer.isPastDue) {
    context.log(`${functionName}: timer is past due, exiting.`)
    return
  }
  const start = performance.now()

  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await busClient.close()
  }

  // connect to service bus...
  try {
    context.log(`${functionName}: connecting to service bus...`)
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver(queueName, {
      receiveMode: 'peekLock'
    })
    context.log(`${functionName}: connected to service bus instance ${busClient.fullyQualifiedNamespace}`)
  } catch (error) {
    context.log.error(`${functionName}: unable to connect to service bus at this time:${error.message}`)
    throw error
  }

  const setId = `${moment().format('YYYYMMDDHHmmss')}`
  let messageBatch = new Array<sb.ServiceBusReceivedMessage>()
  context.log(`${functionName}: attempting to process log set ${setId}...`)
  try {
    messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    let messageCount = 0
    while (!RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: adding ${messageBatch.length} log messages...`)
      const logService = new LogService()
      await logService.createV2(setId, messageBatch)
      await completeMessages(messageBatch, receiver, context)
      messageCount += messageBatch.length
      messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    }
    context.log(`${functionName}: processed ${messageCount} messages...`)
    await disconnect()
    finish(start, context)
    return
  } catch (error) {
    context.log.error(error)
    if (!RA.isNilOrEmpty(messageBatch)) {
      await abandonMessages(messageBatch, receiver, context)
    }
    throw error
  }
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await receiver.completeMessage(msg)
    } catch (error) {
      try {
        await receiver.abandonMessage(msg)
      } catch {
        context.log.error(`${functionName}: unable to abandon message with id ${msg.messageId} ERROR:${error.message}`)
        // do nothing.
        // the lock will expire and message reprocessed at a later time
      }
    }
  }
}

async function abandonMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    try {
      await receiver.abandonMessage(msg)
    } catch (error) {
      context.log.error(`${functionName}: unable to abandon message with id:${msg.messageId} ERROR:${error.message}`)
    }
  }
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default funcImplementation
