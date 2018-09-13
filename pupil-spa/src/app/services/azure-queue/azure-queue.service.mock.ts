import { Injectable } from '@angular/core';

@Injectable()
export class AzureQueueServiceMock {
  public getQueueService() {
    return {
      createMessage: (queueName, message, cb) => { cb(); }
    };
  }

  public encodeMessage(message: string): string {
    return message;
  }
}
