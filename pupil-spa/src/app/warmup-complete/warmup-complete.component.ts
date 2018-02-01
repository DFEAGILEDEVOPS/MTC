import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { WarmupCompleteRendered,
  CheckStartedApiCalled,
  CheckStartedAPICallSucceeded,
  CheckStarted } from '../services/audit/auditEntry';
import { SubmissionService } from '../services/submission/submission.service';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements OnInit, AfterViewInit {

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private auditService: AuditService,
    private submissionService: SubmissionService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupCompleteRendered());
  }

  async onClick() {
    // console.log(`warmup-complete(): onClick called()`);
    this.auditService.addEntry(new CheckStarted());
    this.clickEvent.emit(null);
    this.submissionService.submitCheckStartData().toPromise()
      .then(() => {
        this.auditService.addEntry(new CheckStartedAPICallSucceeded());
        this.auditService.addEntry(new CheckStartedApiCalled());
      })
      .catch((error) => {
        this.auditService.addEntry(new CheckStartedApiCalled());
      });
  }
}
