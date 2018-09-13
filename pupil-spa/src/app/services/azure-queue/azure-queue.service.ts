import { Injectable } from '@angular/core';

declare let AzureStorage;

@Injectable()
export class AzureQueueService {
  public getQueueService(sasUrl: string, sasToken: string) {
    return AzureStorage.Queue.createQueueServiceWithSas(
      sasUrl,
      sasToken
    ).withFilter(new AzureStorage.Queue.ExponentialRetryPolicyFilter());
  }

  public encodeMessage(message: string): string {
    const encoder = this.getEncoder();
    return encoder.encode(message);
  }

  private getEncoder() {
    return new AzureStorage.Queue.QueueMessageEncoder.TextBase64QueueMessageEncoder();
  }
}
