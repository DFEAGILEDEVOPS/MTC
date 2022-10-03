import { Injectable } from '@angular/core'
import { TestBed, inject } from '@angular/core/testing'
import { RegisterInputService } from './registerInput.service'
import { StorageService } from '../storage/storage.service'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { MonotonicTime } from '../../monotonic-time'

let mockStorageService: StorageService

@Injectable()
export class TestRegisterInputService extends RegisterInputService {

  constructor (protected storageService: StorageService,
               protected monotonicTimeService: MonotonicTimeService) {
    super(storageService, monotonicTimeService)
  }
}

describe('RegisterInputService', () => {
  let storageServiceSetInputSpy
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        TestRegisterInputService,
        StorageService,
        MonotonicTimeService
      ]
    })
    mockStorageService = injector.inject(StorageService)
    storageServiceSetInputSpy = spyOn(mockStorageService, 'setInput')
  })

  it('should be created', inject([TestRegisterInputService], (service: TestRegisterInputService) => {
    expect(service).toBeDefined()
  }))

  it('storeEntry will call localstorage and store with a unique key name',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '0'
      const eventType = 'keydown'
      service.storeEntry(eventValue, eventType, 7, '2x3')
      expect(storageServiceSetInputSpy).toHaveBeenCalledTimes(1)
    }))

  it('StoreEntry should store entry',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const d1 = new Date()
      const entry = {
        input: '0',
        eventType: 'keydown',
        clientTimestamp: d1.toISOString(),
        question: '2x3',
        sequenceNumber: 7,
      }
      service.storeEntry(entry.input, entry.eventType, entry.sequenceNumber, entry.question, d1.valueOf())
      expect(storageServiceSetInputSpy).toHaveBeenCalledTimes(1)
      const arg = storageServiceSetInputSpy.calls.all()[0].args[0]
      expect(arg).toEqual(jasmine.objectContaining(entry))
    }))

  it('StoreEntry will generate new Date if the event timestamp is undefined',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '0'
      const eventType = 'keydown'
      service.storeEntry(eventValue, eventType, 7, '2x3')
      expect(storageServiceSetInputSpy).toHaveBeenCalledTimes(1)
      const clientTimestamp = storageServiceSetInputSpy.calls.all()[0].args[0].clientTimestamp
      expect(clientTimestamp).toBeDefined()
      expect(clientTimestamp).toBeTruthy()
      const cts = new Date(clientTimestamp)
      const now = new Date()
      expect(Math.abs(cts.getTime() - now.getTime())).toBeLessThan(150)
    }))

  it('StoreEntry will generate a high-precision timestamp',
    inject([TestRegisterInputService], (service: TestRegisterInputService) => {
      const eventValue = '0'
      const eventType = 'keydown'
      service.storeEntry(eventValue, eventType, 7, '2x3')
      const mtime = storageServiceSetInputSpy.calls.all()[0].args[0].monotonicTime
      expect(mtime).toBeDefined()
      expect(Object.keys(mtime)).toEqual(['milliseconds', 'legacyDate', 'sequenceNumber'])
    }))
})
