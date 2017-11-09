import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import * as AuditTypes from './auditEntry';

@Injectable()
export class AuditService {

  constructor(private storageService: StorageService) { }

  addEntry(auditEntry: AuditTypes.WarmupIntroRendered |
    AuditTypes.CheckStarted |
    AuditTypes.QuestionRendered |
    AuditTypes.PauseRendered |
    AuditTypes.QuestionAnswered |
    AuditTypes.RefreshDetected |
    AuditTypes.UtteranceStarted |
    AuditTypes.UtteranceEnded): void {
    let existingEntries = this.storageService.getItem('audit') as Array<AuditTypes.AuditEntry>;
    if (!existingEntries) {
      existingEntries = new Array<AuditTypes.AuditEntry>();
    }
    existingEntries.push(auditEntry);
    this.storageService.setItem('audit', existingEntries);
  }
}
