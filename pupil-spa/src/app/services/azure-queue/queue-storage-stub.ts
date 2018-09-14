import {
  IQueueMessageEncoder,
  IQueueService,
  IQueueStorage,
  ITextBase64QueueMessageEncoder
} from './azureStorage';

class TextBase64QueueMessageEncoder implements ITextBase64QueueMessageEncoder {
  constructor() {
    return ({ encode: () => 'encodedMessage' });
  }
  encode: () => 'encodedMessage';
}

const queueMessageEncoder: IQueueMessageEncoder = {
  TextBase64QueueMessageEncoder: TextBase64QueueMessageEncoder
};

export const queueStorageStub: IQueueStorage = {
  createQueueServiceWithSas: () => queueServiceStub,
  LinearRetryPolicyFilter: () => {},
  QueueMessageEncoder: queueMessageEncoder
};

export const queueServiceStub: IQueueService = {
  createMessage: (
    queueName: string,
    encodedMessage: string,
  ) => ({ messageId: '1' }),
  performRequest: () => {},
  withFilter: () => queueServiceStub
};
