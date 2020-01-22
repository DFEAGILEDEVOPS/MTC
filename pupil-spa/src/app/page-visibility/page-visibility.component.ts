import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { AppHidden, AppVisible, RefreshOrTabCloseDetected } from '../services/audit/auditEntry';
import { AuditService } from '../services/audit/audit.service';


@Component({
  selector: 'app-page-visibility',
  templateUrl: './page-visibility.component.html',
  styleUrls: ['./page-visibility.component.scss']
})
export class PageVisibilityComponent {
  constructor(
    private auditService: AuditService,
    private router: Router) {
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification() {
    const currentUrl = this.router.url;
    // This audit report is excluded from check route
    // Check component handles refresh detection accurately at that stage
    if (currentUrl !== '/check') {
      this.auditService.addEntry(new RefreshOrTabCloseDetected());
    }
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange() {
    const visibilityState = document.visibilityState;
    if (visibilityState === 'hidden') {
      this.auditService.addEntry(new AppHidden());
    }
    if (visibilityState === 'visible') {
      this.auditService.addEntry(new AppVisible());
    }
  }
}
