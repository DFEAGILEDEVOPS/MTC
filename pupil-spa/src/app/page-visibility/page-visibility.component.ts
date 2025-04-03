import { Component, HostListener } from '@angular/core';

import { AuditEntryFactory } from '../services/audit/auditEntry'
import { AuditService } from '../services/audit/audit.service';
import { StorageService } from '../services/storage/storage.service';


@Component({
  selector: 'app-page-visibility',
  templateUrl: './page-visibility.component.html',
  styleUrls: ['./page-visibility.component.scss']
})
export class PageVisibilityComponent {
  constructor(
    private auditService: AuditService,
    private storageService: StorageService,
    private auditEntryFactory: AuditEntryFactory) {
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    const checkState = this.storageService.getCheckState();
    // This audit report is excluded from check route
    // Check component handles refresh detection accurately at that stage
    // If check state is detected in local storage we can safely assume the check route is active
    if (!checkState) {
      this.auditService.addEntry(this.auditEntryFactory.createRefreshOrTabCloseDetected());
    }
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange() {
    const visibilityState = document.visibilityState;
    if (visibilityState === 'hidden') {
      this.auditService.addEntry(this.auditEntryFactory.createAppHidden());
    }
    if (visibilityState === 'visible') {
      this.auditService.addEntry(this.auditEntryFactory.createAppVisible());
    }
  }
}
