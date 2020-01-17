import { TestBed } from '@angular/core/testing';
import { AuditService } from './audit.service';
import { StorageService } from '../storage/storage.service';
import { QuestionRendered } from './auditEntry';

let service: AuditService;
let storageService: StorageService;

describe('AuditService', () => {
  beforeEach(() => {
    storageService = new StorageService();
    const injector = TestBed.configureTestingModule({
      providers: [
        AuditService,
        StorageService
      ]
    });
    service = injector.get(AuditService);
    storageService = injector.get(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addEntry', () => {
    it('should add entry as stringified value', () => {
      const spy = spyOn(storageService, 'setAuditEntry');
      const entry = new QuestionRendered();
      service.addEntry(entry);
      expect(spy.calls.all()[0].args[0]).toBe(entry);
    });
  });
});
