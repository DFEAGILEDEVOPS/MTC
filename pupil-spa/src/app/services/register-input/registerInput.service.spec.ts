import { Injectable } from '@angular/core'
import { TestBed, inject } from '@angular/core/testing'
import { RegisterInputService } from './registerInput.service'
import { StorageService } from '../storage/storage.service'

let mockStorageService: StorageService

@Injectable()
export class TestRegisterInputService extends RegisterInputService {

  constructor (protected storageService: StorageService) {
    super(storageService)
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
      expect(arg).toEqual(entry)
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
      expect(Math.abs(cts.getTime() - now.getTime())).toBeLessThan(10) // Should be set to this year not 1970
    }))
})
