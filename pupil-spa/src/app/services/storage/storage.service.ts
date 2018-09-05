import { Injectable } from '@angular/core';

export type StorageKey = 'answers' | 'inputs' | 'session' |
'audit' | 'questions' | 'config' | 'pupil' | 'school' | 'access_token' |
  'feedback' | 'checkstate' | 'device' | 'pending_submission' | 'completed_submission' |
  'preview_completed' | 'feedback_given';

@Injectable()
export class StorageService {

  setItem(key: StorageKey, value: Object | Array<Object>): void {

    if (!key) {
      throw new Error('key is required');
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: StorageKey): any {
    if (!key) {
      throw new Error('key is required');
    }
    return JSON.parse(localStorage.getItem(key));
  }

  removeItem(key: StorageKey): void {
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

  getAllItems(): any {
    return Object.keys(localStorage).reduce((obj, key) => {
      obj[key] = JSON.parse(localStorage.getItem(key));
      return obj;
    }, {});
  }
}
