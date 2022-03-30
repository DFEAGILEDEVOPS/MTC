import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IFunctionTimer } from '../../azure/functions'
import config from '../../config'
import * as sb from '@azure/service-bus'
import * as RA from 'ramda-adjunct'
import { LogService } from './log.service'

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

  const messages: sb.ServiceBusReceivedMessage[] = new Array<sb.ServiceBusReceivedMessage>()

  try {
    let messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    while (!RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: adding ${messageBatch.length} log messages...`)
      context.log(`first message id is ${messageBatch[0].messageId}`)
      messages.push(...messageBatch)
      messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    }
    if (RA.isNilOrEmpty(messages)) {
      context.log(`${functionName}: no messages to process`)
    } else {
      const logService = new LogService()
      context.log(`${functionName}: passing ${messages.length} to log service...`)
      await logService.create(messages)
    }
    await completeMessages(messages, receiver, context)
    await disconnect()
    finish(start, context)
    return
  } catch (error) {
    context.log.error(error)
    await abandonMessages(messages, receiver, context)
    throw error
  }
}

async function completeMessages (messageBatch: sb.ServiceBusReceivedMessage[], receiver: sb.ServiceBusReceiver, context: Context): Promise<void> {
  context.log(`${functionName}: ${messageBatch.length} messages successfully processed, completing all messages in batch...`)
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
