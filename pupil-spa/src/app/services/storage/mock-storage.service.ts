import { Injectable } from '@angular/core';
import { StorageKeyTypesAll } from './storageKey'
import { IStorageService, StorageService } from './storage.service'

@Injectable({
  providedIn: 'root' // singleton - shared storage
})
export class StorageServiceMock extends StorageService implements IStorageService {
  public _localStorage = new Map<string, string>()
  public id: number

  constructor () {
    super()
    this.id =  Math.floor(Math.random() * 9999)
  }

  // Extends StorageService, just swaps out the localStorage for an in-memory map.
  protected setItem(key: StorageKeyTypesAll, value: Object | Array<Object>): void {
    if (!key) {
      throw new Error('key is required');
    }
    try {
      this._localStorage.set(key.toString(), JSON.stringify(value))
    } catch (error) {
      console.error('Storage-service-mock: error setting key: ', error)
    }
  }

  protected getItem(key: StorageKeyTypesAll): any {
    if (!key) {
      throw new Error('key is required')
    }
    let item: string
    try {
      item = this._localStorage.get(key.toString());
    } catch (error) {
      console.error('Storage-service: error getting key: ', error)
    }
    // try/catch as not all localstorage items are JSON, e.g. ai_session
    try {
      item = JSON.parse(item);
    } catch (_) { }
    return item;
  }

  protected removeItem(key: StorageKeyTypesAll): void {
    if (!key) {
      throw new Error('key is required');
    }
    this._localStorage.delete(key.toString());
  }

  clear(): void {
    this._localStorage.clear()
  }

  getAllItems(): Record<string, any> {
    const output: Record<string, any> = {}
    const storageKeys = Array.from(this._localStorage.keys())
    storageKeys.reduce((obj: any, key: string) => {
      let item = this._localStorage.get(key)
      // try/catch as not all localstorage items are JSON, e.g. ai_session
      try {
        item = JSON.parse(item)
      } catch (_) {
        // do nothing, it wasn't JSON
        console.error(_)
       }
     output[key] = item
    }, {})
    return output
  }

  getKeys(): string[] {
    return Array.from(this._localStorage.keys())
  }
}
