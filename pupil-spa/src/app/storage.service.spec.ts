import { TestBed, inject } from '@angular/core/testing';
import { StorageService, StorageKey } from './storage.service';

let service: StorageService;

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

  it('setItem: throws an error when key missing', () => {
    spyOn(localStorage, 'setItem');
    try {
      service.setItem(null, 'xxxx');
    } catch (error) {
      expect(error).toBeTruthy();
      expect(localStorage.setItem).toHaveBeenCalledTimes(0);
      expect(error.message).toEqual('key is required');
    }
  });

  it('setItem: adds item to localStorage when key provided', () => {
    spyOn(localStorage, 'setItem');
    const key: StorageKey = 'answers';
    const value = 'setItem_value';

    service.setItem(key, value);

    expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
  });

  it('getItem: throws an error when key missing', () => {
    spyOn(localStorage, 'getItem');

    try {
      service.getItem(null);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.message).toEqual('key is required');
      expect(localStorage.getItem).toHaveBeenCalledTimes(0);
    }
  });

  it('getItem: returns item when key provided and item exists', () => {
    const key = 'answer';
    const value = 'getItem_Value';
    localStorage.setItem(key, value);

    const data = service.getItem(key);

    expect(data).toBeTruthy();
    expect(data).toEqual(value);
  });

  it('getItem: returns null when key provided and item does not exist', () => {
    const key = 'answer';
    const value = 'getItem_Value';

    const data = service.getItem(key);

    expect(data).toBeNull();
  });

  it('removeItem: throws an error when key not provided', () => {
    spyOn(localStorage, 'removeItem');

    try {
      service.removeItem(null);
    } catch (error) {
      expect(localStorage.removeItem).toHaveBeenCalledTimes(0);
      expect(error).toBeTruthy();
      expect(error.message).toEqual('key is required');
    }
  });

  it('removeItem: removes item when key provided and item exists', () => {
    spyOn(localStorage, 'removeItem');
    const removeItemKey = 'answer';

    service.removeItem(removeItemKey);

    expect(localStorage.removeItem).toHaveBeenCalledWith(removeItemKey);
  });

  it('clear: calls localStorage.clear', () => {
    spyOn(localStorage, 'clear');

    service.clear();

    expect(localStorage.clear).toHaveBeenCalled();
  });

  it('getKeys: returns all keys from localStorage', () => {
    const items = [
      { key: 'item1', value: 'item1value' },
      { key: 'item2', value: 'item2value' },
      { key: 'item3', value: 'item3value' },
    ];
    items.forEach((item) => {
      localStorage.setItem(item.key, item.value);
    });

    const keys = service.getKeys();

    expect(keys[0]).toEqual(items[0].key);
    expect(keys[1]).toEqual(items[1].key);
    expect(keys[2]).toEqual(items[2].key);
  });

});
