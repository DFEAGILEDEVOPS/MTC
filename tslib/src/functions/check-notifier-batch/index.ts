import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'check-notify'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { ICheckNotificationMessage } from '../check-notifier/check-notification-message'
import { BatchCheckNotifier } from './batch-check-notifier.service'

if (!config.ServiceBus.ConnectionString) {
  throw new Error('ServiceBusConnection env var is required')
}

const busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
const queueClient = busClient.createQueueClient('check-notification')
const receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)

const batchNotifier = new BatchCheckNotifier()

const batchCheckNotifier: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()
  context.log(`timer triggered at ${Date.now()}`)
  const messageBatch = await receiver.receiveMessages(config.ServiceBus.BatchReceiveCount)
  const notifications: ICheckNotificationMessage[] = []
  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    const notification = msg.body as ICheckNotificationMessage
    console.log(`processing notification ${notification.notificationType} for check:${notification.checkCode}`)
    notifications.push(notification)
  }
  try {
    await batchNotifier.notify(notifications)
    messageBatch.forEach(async msg => {
      await msg.complete()
    })
  } catch (error) {
    context.log.error(error.message)
    messageBatch.forEach(async msg => {
      // undo message pickup
      try {
        await msg.abandon()
      } catch (error) {
        context.log.error(`unable to abandon message:${error.message}`)
      }
    })
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default batchCheckNotifier
