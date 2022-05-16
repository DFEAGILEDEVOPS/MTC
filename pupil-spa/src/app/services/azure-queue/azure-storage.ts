import { InjectionToken } from '@angular/core';

/**
 * encode message as base64
 * send correct headers
 * retry mechanism
 */

export const QUEUE_STORAGE_TOKEN = new InjectionToken<IQueueStorage>('QUEUE_STORAGE_TOKEN');


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
  createMessage: (queueName: string, encodedMessage: string, options?: any) => any;
}


export interface IQueueMessageEncoder {
  TextBase64QueueMessageEncoder: new () => ITextBase64QueueMessageEncoder;
}

export interface ITextBase64QueueMessageEncoder {
  encode: (message: string) => string;
}

