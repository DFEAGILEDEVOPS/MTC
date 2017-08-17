import { Injectable } from '@angular/core';
import { AuditService } from './audit.service';
import { AuditEntry, AuditEntryType } from './auditEntry';

@Injectable()
export class AuditServiceMock {
  addEntry(auditEntry: AuditEntry): void {
   }
}
