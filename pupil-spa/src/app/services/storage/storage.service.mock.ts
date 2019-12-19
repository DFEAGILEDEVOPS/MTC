import { StorageKeyTypesAll } from './storageKey';

export class StorageServiceMock {
  private store = {};

  setItem(key: StorageKeyTypesAll, value: Object | Array<Object>): void {
    this.store[key.toString()] = value;
  }

  getItem(key: StorageKeyTypesAll): any {
    return this.store[key.toString()];
  }

  removeItem(key: StorageKeyTypesAll): void {
    if (!key) {
      throw new Error('key is required');
    }
    delete this.store[key.toString()];
  }

  clear(): void {
    this.store = {};
  }

  getKeys(): string[] {
    return Object.keys(this.store);
  }
  getAllItems(): any {
    return this.store;
  }
}
