import { Injectable } from '@angular/core';

export type StorageKey = 'answers' | 'inputs' | 'session' | 'audit' | 'questions';

@Injectable()
export class StorageService {

  setItem(key : StorageKey, value : string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        const err = new Error('key is required');
        reject(err);
      } else {
        localStorage.setItem(key, value);
        resolve();
      }
    });
  }

  getItem(key : StorageKey): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        const err = new Error('key is required');
        reject(err);
      } else {
        const item = localStorage.getItem(key);
        resolve(item);
      }
    });
  }

  removeItem(key : StorageKey): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        const err = new Error('key is required');
        reject(err);
      } else {
        localStorage.removeItem(key);
        resolve();
      }
    });
  }

  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      localStorage.clear();
      resolve();
    });
  }

  getKeys(): Promise<any> {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(localStorage);
      resolve(keys);
    });
  }

}
