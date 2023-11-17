import { ServiceBusClient } from '@azure/service-bus'
import config from '../pupil-api/config'
import { type ServiceBusQueueName } from './service-bus-queue.names'

export interface IServiceBusQueueService {
  dispatch (message: IServiceBusQueueMessage, queueName: string): Promise<void>
}

export interface IServiceBusQueueMessage {
  body: any
}

export class ServiceBusQueueService implements IServiceBusQueueService {
  private readonly serviceBusClient: ServiceBusClient

  constructor () {
    if (config.ServiceBus.connectionString === undefined) {
      throw new Error('Azure Service Bus Connection String missing')
    }
    this.serviceBusClient = new ServiceBusClient(config.ServiceBus.connectionString)
  }

  async dispatch (message: IServiceBusQueueMessage, queueName: ServiceBusQueueName): Promise<void> {
    const sender = this.serviceBusClient.createSender(queueName.toString())
    await sender.sendMessages(message)
    return sender.close()
  }
}
