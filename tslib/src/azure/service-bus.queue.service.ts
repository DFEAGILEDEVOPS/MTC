import config from '../pupil-api/config'
import { type ServiceBusQueueNames } from './service-bus-queue.names'
import { ServiceBusAdministrationClient, ServiceBusClient } from '@azure/service-bus'

export interface IServiceBusQueueService {
  dispatch (message: IServiceBusQueueMessage, queueName: string): Promise<void>
  getActiveMessageCount (queueName: ServiceBusQueueNames): Promise<number>
}

export interface IServiceBusQueueMessage {
  body: any
  messageId?: string
  contentType?: string
}

export class ServiceBusQueueService implements IServiceBusQueueService {
  private readonly serviceBusClient: ServiceBusClient
  private readonly serviceBusAdministrationClient: ServiceBusAdministrationClient

  constructor () {
    if (config.ServiceBus.connectionString === undefined) {
      throw new Error('Azure Service Bus Connection String missing')
    }
    this.serviceBusClient = new ServiceBusClient(config.ServiceBus.connectionString)
    this.serviceBusAdministrationClient = new ServiceBusAdministrationClient(config.ServiceBus.connectionString)
  }

  async dispatch (message: IServiceBusQueueMessage, queueName: ServiceBusQueueNames): Promise<void> {
    const sender = this.serviceBusClient.createSender(queueName.toString())
    await sender.sendMessages(message)
    return sender.close()
  }

  async getActiveMessageCount (queueName: ServiceBusQueueNames): Promise<number> {
    const queueRuntimeProperties = await this.serviceBusAdministrationClient.getQueueRuntimeProperties(queueName.toString())
    const msgCount = queueRuntimeProperties.activeMessageCount
    if (msgCount === undefined || msgCount === null) {
      return -1
    }
    return msgCount
  }
}
