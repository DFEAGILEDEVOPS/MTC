import { TestBed, inject } from '@angular/core/testing';
import { StorageServiceMock } from './storage.service.mock';
import { AuditService } from './audit.service';
import { StorageService } from './storage.service';
import { AuditEntry, AuditEntryType } from './auditEntry';

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

    it('should add entry using audit key to storageService', () => {
      spyOn(mockStorageService, 'setItem');

      const entry = new AuditEntry('QuestionRendered', new Date());
      service.addEntry(entry);

      expect(mockStorageService.setItem).toHaveBeenCalledWith('audit', [entry]);
    });

    it('should add as one item array if no existing entries', () => {
      const entry = new AuditEntry('CheckStarted', new Date());
      let entries = new Array<AuditEntry>();

      spyOn(mockStorageService, 'getItem').and.callFake(() => {
        return null;
      });

      spyOn(mockStorageService, 'setItem').and.callFake((key, value) => {
        entries = value;
      });

      service.addEntry(entry);

      expect(mockStorageService.getItem).toHaveBeenCalledTimes(1);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('audit');
      expect(mockStorageService.setItem).toHaveBeenCalledTimes(1);
      expect(mockStorageService.setItem).toHaveBeenCalledWith('audit', entries);
    });

    it('should append new entries, preserve existing ones', () => {
      const firstEntry = new AuditEntry('PauseRendered', new Date(), { foo: 'bar' });
      const secondEntry = new AuditEntry('CheckStarted', new Date());
      const thirdEntry = new AuditEntry('QuestionRendered', new Date());
      const expectedAuditEntries = new Array<AuditEntry>(firstEntry, secondEntry, thirdEntry);
      let actualAuditEntries = new Array<AuditEntry>();

      spyOn(mockStorageService, 'setItem').and.callFake((key, value) => {
        actualAuditEntries = value;
      });

      spyOn(mockStorageService, 'getItem').and.callFake((key) => {
        return actualAuditEntries;
      });

      service.addEntry(firstEntry);
      service.addEntry(secondEntry);
      service.addEntry(thirdEntry);

      expect(mockStorageService.setItem).toHaveBeenCalledTimes(3);
      expect(actualAuditEntries.length).toEqual(3);
      expect(actualAuditEntries).toEqual(expectedAuditEntries);

    });
  });
});
