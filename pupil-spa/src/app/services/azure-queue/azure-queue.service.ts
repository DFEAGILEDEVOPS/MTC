import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';

declare let AzureStorage;

@Injectable()
export class AzureQueueService {
  constructor() { }

  public getQueueService(sasUrl: string, sasToken: string) {
    return AzureStorage.Queue.createQueueServiceWithSas(
      sasUrl,
      sasToken
    ).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
  }

  public encodeMessage(message: string): string {
    const encoder = this.getEncoder();
    return encoder.encodeMessage(message);
  }

  private getEncoder() {
    return new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();
  }
}
