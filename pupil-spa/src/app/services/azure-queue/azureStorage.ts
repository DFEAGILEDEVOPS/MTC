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
  setServiceProperties: (serviceProperties: IQueueServiceProperties) => any;
}

  /**
* Sets the properties of a storage account’s Queue service, including Microsoft Azure Storage Analytics.
* You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
*
* @this {QueueService}
* @param {object}             serviceProperties                        The service properties.
* @param {object}             [options]                                The request options.
* @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to.
*                                                                      Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]       The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                      execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                      The default value is false.
* @param {errorOrResponse}  callback                                   `error` will contain information
*                                                                      if an error occurs; otherwise, `response`
*                                                                      will contain information related to this operation.
*/
// TODO: add jsdoc
export interface IQueueServiceProperties {
  timeoutIntervalInMs?: number;
  clientRequestTimeoutInMs?: number;
  maximumExecutionTimeoutInMs?: number;
  useNagleAlgorithm?: boolean;
  clientRequestId?: string;
}

export interface IQueueMessageEncoder {
  TextBase64QueueMessageEncoder: new () => ITextBase64QueueMessageEncoder;
}

export interface ITextBase64QueueMessageEncoder {
  encode: (message: string) => string;
}

export const QUEUE_STORAGE_TOKEN = new InjectionToken<IQueueStorage>('QUEUE_STORAGE_TOKEN');
