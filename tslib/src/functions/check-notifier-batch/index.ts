import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'check-notify'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { ICheckNotificationMessage } from '../check-notifier/check-notification-message'
import { BatchCheckNotifier } from './batch-check-notifier.service'

/*
* This is a poc with certain assumptions...
* The function is running as a singleton, and the receiver is therefore exclusive
  we do not expect another receive operation to be in progress.
  if the message is abandoned 10 times (the current 'max delivery count') it will be
  put on the dead letter queue automatically.
*/
const batchCheckNotifier: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()

  if (!config.ServiceBus.ConnectionString) {
    throw new Error('ServiceBusConnection env var is missing')
  }
  const errors: Array<Error> = []
  let busClient
  let queueClient
  let receiver
  // connect to service bus...
  try {
    context.log('connecting to service bus...')
    busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
    queueClient = busClient.createQueueClient('check-notification')
    receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)
    context.log(`connected to service bus instance ${busClient.name}`)
  } catch (error) {
    context.log.error(`unable to connect to service bus at this time:${error.message}`)
    throw error
  }
  const batchNotifier = new BatchCheckNotifier()

  for (let batchIndex = 0; batchIndex < config.CheckNotifier.BatchesPerExecution; batchIndex++) {
    context.log(`starting batch ${batchIndex + 1} of ${config.CheckNotifier.BatchesPerExecution}...`)
    const messageBatch = await receiver.receiveMessages(config.CheckNotifier.MessagesPerBatch)
    context.log(`received batch of ${messageBatch.length} messages`)
    const notifications: ICheckNotificationMessage[] = []
    for (let index = 0; index < messageBatch.length; index++) {
      const msg = messageBatch[index]
      const notification = msg.body as ICheckNotificationMessage
      context.log(`processing notification ${notification.notificationType} for check:${notification.checkCode}`)
      notifications.push(notification)
    }

    if (notifications.length === 0) return

    try {
      await batchNotifier.notify(notifications)
      context.log('batch processed successfully, completing all messages in batch')
      messageBatch.forEach(async msg => {
        await msg.complete()
      })
    } catch (error) {
      context.log.error(error.message)
      messageBatch.forEach(async msg => {
        try {
          await msg.abandon()
        } catch (error) {
          context.log.error(`unable to abandon message:${error.message}`)
        }
      })
      errors.push(error)
    }
  }

  await receiver.close()
  await queueClient.close()
  await busClient.close()
  // arguable whether this should come before or after the completion timestamp...
  if (errors.length > 0) {
    const errorList = errors.map(e => e.message).join('\n')
    throw new Error(`errors occured during processing...\n${errorList}`)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default batchCheckNotifier
