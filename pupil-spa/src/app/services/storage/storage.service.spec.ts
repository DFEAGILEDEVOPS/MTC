import * as uuid from 'uuid';

import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { AuditStorageKey, DeviceStorageKey, InputsStorageKey, TimeoutStorageKey } from './storageKey';

let service: StorageService;
const deviceStorageKey = new DeviceStorageKey();
const timeoutStorageKey = new TimeoutStorageKey();

describe('StorageService', () => {

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [StorageService]
    });
    localStorage.clear();
    service = injector.get(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setItem', () => {
    it('adds item to localStorage when key provided', () => {
      spyOn(localStorage, 'setItem');
      const value = { setItem_value: 'value' };
      service.setDeviceData(value);
      expect(localStorage.setItem).toHaveBeenCalledWith(deviceStorageKey.toString(), JSON.stringify(value));
    });
  });

  describe('getItem', () => {
    it('returns JSON item when key provided and item exists', () => {
      const key = 'device';
      const value = { getItem: 'getItem_Value' };
      localStorage.setItem(key, JSON.stringify(value));

      const data = service.getDeviceData();

      expect(data).toBeTruthy();
      expect(data).toEqual(value);
    });

    it('returns string item when key provided and item exists', () => {
      const key = 'device';
      const value = 'foo-bar';
      localStorage.setItem(key, value);

      const data = service.getDeviceData();

      expect(data).toBeTruthy();
      expect(data).toEqual(value);
    });

    it('returns null when key provided and item does not exist', () => {
      const key = 'device';
      const value = 'getItem_Value';

      const data = service.getDeviceData();

      expect(data).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('removes item when key provided and item exists', () => {
      spyOn(localStorage, 'removeItem');

      service.removeTimeout();
      expect(localStorage.removeItem).toHaveBeenCalledWith(timeoutStorageKey.toString());
    });
  });

  describe('clear', () => {
    it('calls localStorage.clear', () => {
      spyOn(localStorage, 'clear');

      service.clear();

      expect(localStorage.clear).toHaveBeenCalled();
    });
  });

  describe('getKeys', () => {
    it('returns all keys from localStorage', () => {
      const items = [
        {key: 'item1', value: [1, 2, 3]},
        {key: 'item2', value: [4, 5, 6]},
        {key: 'item3', value: [7, 8, 9]}
      ];

      items.forEach((item) => {
        localStorage.setItem(item.key, JSON.stringify(item.value));
      });

      const keys = service.getKeys();

      expect(keys.length).toEqual(items.length);
      expect(keys).toContain(items[0].key);
      expect(keys).toContain(items[1].key);
      expect(keys).toContain(items[2].key);
    });
  });

  describe('getAllItems', () => {
    it('returns all key-value pairs from localStorage in a single object', () => {
      const items = [
        { key: 'item1', value: [1, 2, 3] },
        { key: 'item2', value: [4, 5, 6] },
        { key: 'item3', value: 'foo-bar' }
      ];

      items.forEach((item) => {
        let { value } = item;
        if (value !== 'foo-bar') {
          value = JSON.stringify(value);
        }
        localStorage.setItem(item.key, value);
      });

      const localStorageItems = service.getAllItems();

      expect(Object.keys(localStorageItems).length).toEqual(3);
      expect(localStorageItems[items[0].key]).toEqual([1, 2, 3]);
      expect(localStorageItems[items[1].key]).toEqual([4, 5, 6]);
      expect(localStorageItems[items[2].key]).toEqual('foo-bar');
    });
  });
});
