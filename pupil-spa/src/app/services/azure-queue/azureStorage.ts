import { InjectionToken } from '@angular/core';

export interface IAzureStorage {
  Queue: IQueueStorage;
}

export interface IQueueStorage {
  LinearRetryPolicyFilter: any;
  createQueueServiceWithSas: (uri: string, sharedAccessToken: string) => IQueueService;
  QueueMessageEncoder: IQueueMessageEncoder;
}

export interface IQueueService {
  withFilter: (filter: any) => IQueueService;
  performRequest: any;
  createMessage: (queueName: string, encodedMessage: string) => any;
}

export interface IQueueMessageEncoder {
  TextBase64QueueMessageEncoder: new () => ITextBase64QueueMessageEncoder;
}

export interface ITextBase64QueueMessageEncoder {
  encode: (message: string) => string;
}

export interface IPromisifier {
  promisify: (method: any, service: any) => any;
}

export const QUEUE_STORAGE_TOKEN = new InjectionToken<IQueueStorage>('QUEUE_STORAGE_TOKEN');
