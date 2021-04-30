import { ServiceBusClient, ReceiveMode } from '@azure/service-bus'

export interface IMessageReplayService {
  replay (request: IQueueMessageReplayRequest): Promise<void>
}

export class ServiceBusMessageReplayService implements IMessageReplayService {
 replay (request: IQueueMessageReplayRequest): Promise<void> {
   throw new Error('not implemented')
 }
}

export class StorageQueueMessageReplayService implements IMessageReplayService {
  replay (request: IQueueMessageReplayRequest): Promise<void> {
    throw new Error('not implemented')
  }
 }

export interface IQueueMessageReplayRequest {
  queueName: string
  messageCount?: number
}
