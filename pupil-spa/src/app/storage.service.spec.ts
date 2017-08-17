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

  describe('setItem', () => {

    it('throws an error when key missing', () => {
      spyOn(localStorage, 'setItem');
      try {
        service.setItem(null, 'xxxx');
      } catch (error) {
        expect(error).toBeTruthy();
        expect(localStorage.setItem).toHaveBeenCalledTimes(0);
        expect(error.message).toEqual('key is required');
      }
    });

    it('adds item to localStorage when key provided', () => {
      spyOn(localStorage, 'setItem');
      const key: StorageKey = 'answers';
      const value = {setItem_value: 'value'};

      service.setItem(key, value);

      expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('getItem', () => {

    it('throws an error when key missing', () => {
      spyOn(localStorage, 'getItem');

      try {
        service.getItem(null);
      } catch (error) {
        expect(error).toBeTruthy();
        expect(error.message).toEqual('key is required');
        expect(localStorage.getItem).toHaveBeenCalledTimes(0);
      }
    });

    it('returns item when key provided and item exists', () => {
      const key = 'answers';
      const value = { getItem: 'getItem_Value'};
      localStorage.setItem(key, JSON.stringify(value));

      const data = service.getItem(key);

      expect(data).toBeTruthy();
      expect(data).toEqual(value);
    });

    it('returns null when key provided and item does not exist', () => {
      const key = 'answers';
      const value = 'getItem_Value';

      const data = service.getItem(key);

      expect(data).toBeNull();
    });
  });

  describe('removeItem', () => {

    it('throws an error when key not provided', () => {
      spyOn(localStorage, 'removeItem');

      try {
        service.removeItem(null);
      } catch (error) {
        expect(localStorage.removeItem).toHaveBeenCalledTimes(0);
        expect(error).toBeTruthy();
        expect(error.message).toEqual('key is required');
      }
    });

    it('removes item when key provided and item exists', () => {
      spyOn(localStorage, 'removeItem');
      const removeItemKey = 'answers';

      service.removeItem(removeItemKey);

      expect(localStorage.removeItem).toHaveBeenCalledWith(removeItemKey);
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
        { key: 'item1', value: [1,2,3] },
        { key: 'item2', value: [4,5,6] },
        { key: 'item3', value: [7,8,9] }
      ];

      items.forEach((item) => {
        localStorage.setItem(item.key, JSON.stringify(item.value));
      });

      const keys = service.getKeys();
      console.log('keys are:', keys);

      expect(keys.length).toEqual(items.length);
      expect(keys).toContain(keys[0]);
      expect(keys).toContain(keys[1]);
      expect(keys).toContain(keys[2]);
    });
  });
});
