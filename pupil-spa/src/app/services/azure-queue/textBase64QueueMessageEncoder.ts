import {
  IQueueMessageEncoder,
  ITextBase64QueueMessageEncoder,
} from './azure-storage';

export class TextBase64QueueMessageEncoder implements ITextBase64QueueMessageEncoder {
  private encoder;
  constructor(queueMessageEncoder: IQueueMessageEncoder) {
    this.encoder = new queueMessageEncoder.TextBase64QueueMessageEncoder();
  }
  /**
   * Calls the base64 encoding for the message provided
   * @param {String} message
   * @returns {String}
   */
  encode(message: string) {
    return this.encoder.encode(message);
  }
}
