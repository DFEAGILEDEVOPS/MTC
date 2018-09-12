import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service'

declare let AzureStorage;

@Injectable()
export class AzureQueueService {
  constructor() { }

  private getQueueService(sasUrl: string, sasToken: string) {
    return AzureStorage.Queue.createQueueServiceWithSas(
      APP_CONFIG[sasUrl],
      APP_CONFIG[sasToken]
    ).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
  }

  private getEncoder() {
    return new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();
  }
}
