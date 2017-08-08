import { Inject, Injectable } from '@angular/core';

@Injectable()
export class StorageService {

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
