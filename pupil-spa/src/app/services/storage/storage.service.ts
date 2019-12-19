import { Injectable } from '@angular/core';
import { StorageKeyTypesAll, StorageKeyPrefix } from './storageKey';

@Injectable()
export class StorageService {

  setItem(key: StorageKeyTypesAll, value: Object | Array<Object>): void {
    if (!key) {
      throw new Error('key is required');
    }
    localStorage.setItem(key.toString(), JSON.stringify(value));
  }

  getItem(key: StorageKeyTypesAll): any {
    if (!key) {
      throw new Error('key is required');
    }
    let item = localStorage.getItem(key.toString());
    // try/catch as not all localstorage items are JSON, e.g. ai_session
    try {
      item = JSON.parse(item);
    } catch (_) { }
    return item;
  }

  removeItem(key: StorageKeyTypesAll): void {
    if (!key) {
      throw new Error('key is required');
    }
    localStorage.removeItem(key.toString());
  }

  clear(): void {
    localStorage.clear();
  }

  getKeys(): string[] {
    return Object.keys(localStorage);
  }

  getAllItems(): any {
    return Object.keys(localStorage).reduce((obj, key) => {
      let item = localStorage.getItem(key);
      // try/catch as not all localstorage items are JSON, e.g. ai_session
      try {
        item = JSON.parse(item);
      } catch (_) { }
      obj[key] = item;
      return obj;
    }, {});
  }

  fetchAllEntriesByKey(key: StorageKeyPrefix): any {
    const localStorageItems = this.getAllItems();
    const matchingKeys =
      Object.keys(localStorageItems).filter(lsi => lsi.startsWith(key.toString()));
    const sortedMatchingKeys = matchingKeys.sort((a, b) => localStorageItems[a].clientTimestamp - localStorageItems[b].clientTimestamp);
    const matchingItems = [];
    sortedMatchingKeys.forEach(s => {
      matchingItems.push(localStorageItems[s]);
    });
    return matchingItems;
  }
}
