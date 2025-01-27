import { Injectable } from '@angular/core';
import { AuditEntry } from './auditEntry';

@Injectable()
export class AuditServiceMock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEntry(auditEntry: AuditEntry): void {}
}
