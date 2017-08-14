import { Injectable } from '@angular/core';
import { Answer } from './answer.service';

export type StorageKey = 'answers' | 'inputs' | 'session' | 'audit' | 'questions';

@Injectable()
export class StorageService {

  setItem(key, value: Object | Array<Object>): void {

    if (!key) {
      throw new Error('key is required');
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key): any {
    if (!key) {
      throw new Error('key is required');
    }
    return JSON.parse(localStorage.getItem(key));
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
