import { TestBed, inject } from '@angular/core/testing'

import { StorageService } from './storage.service'

let service: StorageService

describe('StorageService', () => {

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
      (err) => {
        expect(err).toBeTruthy()
        expect(err).toEqual('key is required')
      }
    )
  })

  it('setItem: returns a promise that resolves when key provided', () => {

    service.setItem('setItem_key', 'xxxx').then(
      (err) => {
        expect(err).toBeFalsy()
      }
    )
  })

  it('getItem: returns a promise that rejects when key missing', () => {

    service.getItem(null).then(
      (err) => {
        expect(err).toBeTruthy()
        expect(err).toEqual('key is required')
      })
  })

  it('getItem: returns a promise that returns item when key provided and item exists', () => {
    const itemKey = 'x4tw8fdf'
    const itemValue = 'sdjfkldsj489fg'
    service.setItem(itemKey, itemValue).then(function () {
      service.getItem(itemKey).then(
        (data) => {
          expect(data).toBeTruthy()
          expect(data).toEqual(itemValue)
        })
    })
  })

  it('removeItem: returns a promise that rejects when key not provided', () => {
    service.removeItem(null).then(
      (err) => {
        //expect(err).toBeTruthy()
        console.log(err)
        expect(err).toEqual('key is required')
      })
  })

  it('removeItem: returns a promise that resolves when key provided', () => {
    service.removeItem('removeItem_key').then(
      (err) => {
        expect(err).toBeFalsy()
      }
    )
  })

});
