import { TestBed, inject } from '@angular/core/testing';
import { StorageService, StorageKey } from './storage.service';

let service: StorageService;

describe('StorageService', () => {

  const shouldNotExecute = () => {
    expect('this code not').toBe('executed');
  };

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

  it('setItem: returns a promise that rejects when key missing', () => {
    spyOn(localStorage, 'setItem');
    service.setItem(null, 'answer').then(
      () => {
        shouldNotExecute();
      },
      (err) => {
        expect(err).toBeTruthy();
        expect(localStorage.setItem).toHaveBeenCalledTimes(0);
        expect(err.message).toEqual('key is required');
      });
  });

  it('setItem: returns a promise that resolves when key provided', () => {
    spyOn(localStorage, 'setItem');
    const key : StorageKey = 'answers';
    const value = 'setItem_value';
    service.setItem(key, value).then(
      () => {
        expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
      },
      (err) => {
        shouldNotExecute();
      });
  });

  it('getItem: returns a promise containing item when key provided and item exists', () => {
    const key : StorageKey = 'answers';
    const value = 'getItem_Value';
    localStorage.setItem(key, value);

    service.getItem(key).then(
      (data) => {
        expect(data).toBeTruthy();
        expect(data).toEqual(value);
      },
      (err) => {
        shouldNotExecute();
      });
  });

  it('removeItem: returns a promise that rejects when key not provided', () => {
    spyOn(localStorage, 'removeItem');

    service.removeItem(null).then(
      () => { shouldNotExecute(); },
      (err) => {
        expect(localStorage.removeItem).toHaveBeenCalledTimes(0);
        expect(err).toBeTruthy();
        expect(err.message).toEqual('key is required');
      });
  });

  it('removeItem: returns a promise that resolves when key provided', () => {
    spyOn(localStorage, 'removeItem');
    const removeItemKey : StorageKey = 'answers';

    service.removeItem(removeItemKey).then(
      () => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(removeItemKey);
      },
      (err) => {
        shouldNotExecute();
      });
  });

  it('clear: returns a promise that resolves', () => {
    spyOn(localStorage, 'clear');

    service.clear().then(
      () => {
        expect(localStorage.clear).toHaveBeenCalled();
      },
      (err) => {
        shouldNotExecute();
      });
  });

  it('getKeys: returns a promise that resolves all keys', () => {
    const items = [
      { key: 'item1', value: 'item1value' },
      { key: 'item2', value: 'item2value' },
      { key: 'item3', value: 'item3value' },
    ];
    items.forEach((item) => {
      localStorage.setItem(item.key, item.value);
    });
    service.getKeys().then(
      (keys) => {
        expect(keys[0]).toEqual(items[0].key);
        expect(keys[1]).toEqual(items[1].key);
        expect(keys[2]).toEqual(items[2].key);
      },
      (err) => {
        shouldNotExecute();
      });
  });

});
