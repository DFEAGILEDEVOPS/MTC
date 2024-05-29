import { ServiceBusClient } from '@azure/service-bus'

export interface IServiceBusQueueAdminDataService {
  getQueueCount(queueName: string): Promise<number>
  clear(queueName: string): Promise<void>
}

export class ServiceBusQueueAdminDataService implements IServiceBusQueueAdminDataService {
  async getQueueCount (queueName: string): Promise<number> {
    throw new Error('Not implemented')
  }

  async clear (queueName: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
