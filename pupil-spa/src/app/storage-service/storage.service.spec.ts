import { TestBed, inject } from '@angular/core/testing'

import { StorageService } from './storage.service'

let service: StorageService

describe('StorageService', () => {

  const shouldNotExecute = () => {
    expect(1).toBe(2)
  }

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [StorageService]
    })
    service = injector.get(StorageService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('setItem: returns a promise that rejects when key missing', () => {

    service.setItem(null, 'xxxx').then(
      () => {
        shouldNotExecute()
      },
      (err) => {
        expect(err).toBeTruthy()
        expect(err.message).toEqual('key is required')
      }
    )
  })

  it('setItem: returns a promise that resolves when key provided', () => {

    service.setItem('setItem_key', 'xxxx').then(
      () => { },
      (err) => { shouldNotExecute() }
    )
  })

  it('getItem: returns a promise that rejects when key missing', () => {

    service.getItem(null).then(
      () => { shouldNotExecute() },
      (err) => {
        expect(err).toBeTruthy()
        expect(err.message).toEqual('key is required')
      })
  })

  it('getItem: returns a promise that returns item when key provided and item exists', () => {
    const itemKey = new Date().getTime()
    const itemValue = itemKey.toString()
    service.setItem(itemKey, itemValue).then(function () {
      service.getItem(itemKey).then(
        (data) => {
          expect(data).toBeTruthy()
          expect(data).toEqual(itemValue)
        },
        (err) => { shouldNotExecute() })
    })
  })

  it('removeItem: returns a promise that rejects when key not provided', () => {
    service.removeItem(null).then(
      () => { shouldNotExecute() },
      (err) => {
        expect(err).toBeTruthy()
        expect(err.message).toEqual('key is required')
      })
  })

  it('removeItem: returns a promise that resolves when key provided', () => {
    service.removeItem('removeItemKey').then(
      () => { },
      (err) => { shouldNotExecute() }
    )
  })

  it('clear: returns a promise that resolves', () => {
    service.clear().then(
      () => { },
      (err) => { shouldNotExecute() } //really??? we should be spying on localStorage...
    )
  })

  it('getKeys: returns a promise that resolves all keys', () => {
    let items = [
      { key: 'item1', value: 'item1value' },
      { key: 'item2', value: 'item2value' },
      { key: 'item3', value: 'item3value' },
    ]
    items.forEach((item) => {
      localStorage.setItem(item.key, item.value)
    })
    service.getKeys().then(
        (keys) => {
          expect(keys[0]).toEqual(items[0].key)
          expect(keys[1]).toEqual(items[1].key)
          expect(keys[2]).toEqual(items[2].key)
        },
        (err) => { shouldNotExecute() }
      )
  })

});
