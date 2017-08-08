import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  /*
  For now we will program directly against localStorage,
  but we should consider an existing library depending on
  performance results.  Such as...
  https://www.npmjs.com/package/angular-cyanez-local-storage
  */

  /*
  localStorage interface:
  readonly attribute unsigned long length;
    DOMString? key(unsigned long index);
    getter DOMString? getItem(DOMString key);
    setter void setItem(DOMString key, DOMString value);
    deleter void removeItem(DOMString key);
    void clear();
  */

  setItem(key, value): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        var err = new Error('key is required')
        reject(err)
      } else {
        localStorage.setItem(key, value)
        resolve()
      }
    })
  }

  getItem(key): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        var err = new Error('key is required')
        reject(err)
      } else {
        let item = localStorage.getItem(key)
        resolve(item)
      }
    })
  }

  removeItem(key): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!key) {
        var err = new Error('key is required')
        reject(err)
      } else {
        localStorage.removeItem(key)
        resolve()
      }
    })
  }

  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      localStorage.clear()
      resolve()
    })
  }

  getKeys(): Promise<any> {
    return new Promise((resolve,reject) => {
      var keys = Object.keys(localStorage)
      resolve(keys)
    })
  }

}
