import { QueueServiceClient, AnonymousCredential, QueueSendMessageOptions, QueueSendMessageResponse } from '@azure/storage-queue'


export class NewAzureQueueService {
  async addMessageToQueue (storageAccountUrl: string, queueName: string, sasToken: string,  payload: any, messageTtl = -1): Promise<QueueSendMessageResponse> {
    const anonymousCredential = new AnonymousCredential();
    const queueServiceClient = new QueueServiceClient(`${storageAccountUrl}?${sasToken}`, anonymousCredential)
    const queueClient = queueServiceClient.getQueueClient(queueName);
    const options: QueueSendMessageOptions = {
      messageTimeToLive: messageTtl
    }
    // TODO: what about retry policy?
    return queueClient.sendMessage(payload, options)
  }
}
''
