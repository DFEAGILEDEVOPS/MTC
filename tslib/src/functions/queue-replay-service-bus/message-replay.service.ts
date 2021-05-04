export interface IMessageReplayService {
  replay (request: IQueueMessageReplayRequest): Promise<void>
}

export class ServiceBusMessageReplayService implements IMessageReplayService {
  async replay (request: IQueueMessageReplayRequest): Promise<void> {
    throw new Error('not implemented')
  }
}

export class StorageQueueMessageReplayService implements IMessageReplayService {
  async replay (request: IQueueMessageReplayRequest): Promise<void> {
    throw new Error('not implemented')
  }
}

export interface IQueueMessageReplayRequest {
  queueName: string
  messageCount?: number
}
