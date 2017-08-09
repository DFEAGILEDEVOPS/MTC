import { Inject, Injectable } from '@angular/core';

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
