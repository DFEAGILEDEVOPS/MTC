import { Injectable } from '@angular/core';

export type StorageKey = 'answers' | 'inputs' | 'session' | 'audit' | 'questions';

@Injectable()
export class StorageService {

  setItem(key, value): void {

    if (!key) {
      throw new Error('key is required');
    } else {
      localStorage.setItem(key, value);
    }

  }

  getItem(key): any {
    if (!key) {
      throw new Error('key is required');
    } else {
      return localStorage.getItem(key);
    }
  }

  removeItem(key): void {
    if (!key) {
      throw new Error('key is required');
    } else {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    localStorage.clear();
  }

  getKeys(): string[] {
    return Object.keys(localStorage);
  }
}
