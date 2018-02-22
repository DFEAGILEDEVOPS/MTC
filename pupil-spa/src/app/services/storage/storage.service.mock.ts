import { Injectable } from '@angular/core';
import { StorageKey } from './storage.service';

export class StorageServiceMock {
  private store = {};

  setItem(key: StorageKey, value: Object | Array<Object>): void {
    this.store[key] = value;
  }

  getItem(key: StorageKey): any {
    return this.store[key];
  }

  removeItem(key: StorageKey): void {
    if (!key) {
      throw new Error('key is required');
    }
    delete this.store[key];
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
