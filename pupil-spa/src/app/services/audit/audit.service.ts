import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AuditEntry } from './auditEntry';
import { AuditStorageKey } from '../storage/storageKey';

@Injectable()
export class AuditService {
  public static readonly auditKey = 'audit';

  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditEntry): void {
    this.storageService.setItem(new AuditStorageKey(), auditEntry);
  }
}
