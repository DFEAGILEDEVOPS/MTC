import {
  IPromisifier,
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
  createQueueServiceWithSas: () => queueService,
  LinearRetryPolicyFilter: () => {},
  QueueMessageEncoder: queueMessageEncoder
};

const queueService: IQueueService = {
  createMessage: (
    queueName: string,
    encodedMessage: string,
  ) => ({ messageId: '1' }),
  performRequest: () => {},
  withFilter: () => queueService
};

// export const promisifier: IPromisifier = {
//   promisify: () => ({ messageId: '1' })
// };

export class PromisifierStub implements IPromisifier {
  constructor() {}
  public promisify(method, service) {
    return ({ messageId: '1' });
  }
}
