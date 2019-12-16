import { TestBed } from '@angular/core/testing';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { AuditService } from './audit.service';
import { StorageService } from '../storage/storage.service';
import { AuditEntry, QuestionRendered, CheckStarted, QuestionAnswered } from './auditEntry';

let service: AuditService;
let mockStorageService: StorageServiceMock;

describe('AuditService', () => {
  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    const injector = TestBed.configureTestingModule({
      providers: [
        AuditService,
        { provide: StorageService, useValue: mockStorageService }
      ]
    });
    service = injector.get(AuditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addEntry', () => {
    it('should add entry to local storage with a unique key name', () => {
      const spy = spyOn(localStorage, 'setItem');
      const entry = new QuestionRendered();
      service.addEntry(entry);
      expect(spy.calls.all()[0].args[0].indexOf('audit-')).toBeGreaterThanOrEqual(0);
    });
    it('should add entry as stringified value', () => {
      const spy = spyOn(localStorage, 'setItem');
      const entry = new QuestionRendered();
      service.addEntry(entry);
      expect(spy.calls.all()[0].args[1]).toBe(JSON.stringify(entry));
    });
  });
});
