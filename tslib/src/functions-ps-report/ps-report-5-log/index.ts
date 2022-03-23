import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { IFunctionTimer } from '../../azure/functions'
import config from '../../config'
import * as sb from '@azure/service-bus'
import * as RA from 'ramda-adjunct'
import { PsLogGeneratorService } from './log-generator.service'
import { ServiceBusMessageParser } from './message-parser'

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

  try {
    const messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    const messages = new Array<sb.ServiceBusReceivedMessage>()
    while (!RA.isNilOrEmpty(messageBatch)) {
      messages.push(...messageBatch)
    }
    if (RA.isNilOrEmpty(messages)) {
      context.log(`${functionName}: no messages to process`)
    }
    const messageParser = new ServiceBusMessageParser()
    const entries = messageParser.parse(messages)
    const logGenerator = new PsLogGeneratorService()
    await logGenerator.generate(entries)
    await disconnect()
    finish(start, context)
    return
  } catch (error) {
    context.log.error(error)
    throw error
  }
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default funcImplementation
