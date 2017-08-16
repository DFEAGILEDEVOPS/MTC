import { TestBed, inject } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { AuditService } from './audit.service';
import { AuditEntry, AuditEntryType } from './auditEntry';

let service: AuditService;
let storageService: StorageService;

describe('AuditService', () => {
  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [AuditService, StorageService]
    });
    localStorage.clear();
    service = injector.get(AuditService);
    storageService = injector.get(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addEntry', () => {

    it('should add entry using audit key to storageService', () => {
      spyOn(storageService, 'setItem');

      const entry = new AuditEntry('QuestionRendered', new Date());
      service.addEntry(entry);

      expect(storageService.setItem).toHaveBeenCalledWith('audit', [entry]);
    });

    it('should append new entries, preserve existing ones', () => {
      const firstEntry = new AuditEntry('PauseRendered', new Date(), { foo: 'bar' });
      const secondEntry = new AuditEntry('CheckStarted', new Date());
      const thirdEntry = new AuditEntry('QuestionRendered', new Date());
      const expectedEntries = new Array<AuditEntry>(firstEntry, secondEntry, thirdEntry);

      service.addEntry(firstEntry);
      service.addEntry(secondEntry);
      service.addEntry(thirdEntry);

      const storedEntries = storageService.getItem('audit') as AuditEntry[];

      for (let index = 0; index < 3; index++) {
        const entry = storedEntries[index];
        expect(entry).toBeTruthy();
        expect(storedEntries[index].type).toEqual(expectedEntries[index].type);
        const actualDate = new Date(storedEntries[index].clientTimestamp);
        expect(actualDate).toEqual(expectedEntries[index].clientTimestamp);
        expect(storedEntries[index].data).toEqual(expectedEntries[index].data);
      }
    });
  });
});
