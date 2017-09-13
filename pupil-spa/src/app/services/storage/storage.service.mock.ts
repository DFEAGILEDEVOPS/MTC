import { Injectable } from '@angular/core';
import { StorageKey } from './storage.service';

export class StorageServiceMock {

  setItem(key: StorageKey, value: Object | Array<Object>): void {
  }

  getItem(key: StorageKey): any {
    return [];
  }

  removeItem(key: StorageKey): void {
    if (!key) {
      throw new Error('key is required');
    }
  }

  clear(): void {
  }

  getKeys(): string[] {
    return [];
  }
  getAllItems(): any {
    return {};
  }
}
