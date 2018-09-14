import * as bluebird from 'bluebird';
import { IPromisifier } from './azureStorage';

export class Promisifier implements IPromisifier {
  constructor() {}
  public promisify(method, service) {
    return bluebird.promisify(method, service);
  }
}
