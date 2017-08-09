import { Inject, Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  setItem(key, value): void {

    if (!key) {
      throw new Error('key is required');
    }
    localStorage.setItem(key, value);
  }

  getItem(key): any {
    if (!key) {
      throw new Error('key is required');
    }
    return localStorage.getItem(key);
  }

  removeItem(key): void {
    if (!key) {
      throw new Error('key is required');
    }
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  getKeys(): string[] {
    return Object.keys(localStorage);
  }
}
