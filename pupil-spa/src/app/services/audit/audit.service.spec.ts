import { TestBed } from '@angular/core/testing'
import { AuditService } from './audit.service'
import { StorageService } from '../storage/storage.service'
import { QuestionRendered } from './auditEntry'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'

let service: AuditService
let storageService: StorageService
let monotonicTimeService: MonotonicTimeService

describe('AuditService', () => {
  beforeEach(() => {
    storageService = new StorageService()
    const injector = TestBed.configureTestingModule({
      providers: [
        AuditService,
        StorageService
      ]
    })
    service = injector.inject(AuditService)
    storageService = injector.inject(StorageService)
    monotonicTimeService = injector.inject(MonotonicTimeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('addEntry', () => {
    it('should add entry as stringified value', () => {
      const spy = spyOn(storageService, 'setAuditEntry')
      const mtime = monotonicTimeService.getMonotonicDateTime()
      const entry = new QuestionRendered(mtime)
      service.addEntry(entry)
      expect(spy.calls.all()[0].args[0]).toBe(entry)
    })
  })
})
