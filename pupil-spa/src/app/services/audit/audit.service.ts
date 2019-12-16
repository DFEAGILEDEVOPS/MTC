import * as uuid from 'uuid';

import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { AuditEntry } from './auditEntry';

@Injectable()
export class AuditService {
  public static readonly auditKey = 'audit';

  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditEntry): void {
    localStorage.setItem(`${AuditService.auditKey}-${uuid.v4()}`, JSON.stringify(auditEntry));
  }
}
