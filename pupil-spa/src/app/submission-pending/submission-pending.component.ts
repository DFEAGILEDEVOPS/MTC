import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditService } from '../services/audit/audit.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckSubmissionApiCalled, CheckSubmissionAPICallSucceeded } from '../services/audit/auditEntry';

@Component({
  selector: 'app-submission-pending',
  templateUrl: './submission-pending.component.html',
  styleUrls: ['./submission-pending.component.scss']
})
export class SubmissionPendingComponent implements OnInit {

  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  public title;
  constructor(private submissionService: SubmissionService,
              private auditService: AuditService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  async ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    this.title = queryParams && queryParams.unfinishedCheck ?
      'Uploading previous check' : 'You have finished the check';
    const start = Date.now();
    await this.submissionService.submitData().toPromise()
      .then(async () => {
        this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
        this.auditService.addEntry(new CheckSubmissionApiCalled());
        // Display pending screen for the minimum configurable time
        const end = Date.now();
        const duration = end - start;
        const minDisplay = environment.submissionPendingViewMinDisplay;
        if (duration < minDisplay) {
          const displayTime = minDisplay - duration;
          await this.sleep(displayTime);
        }
        await this.loadComponent(true);
        return;
      })
      .catch(async (error) => {
        this.auditService.addEntry(new CheckSubmissionApiCalled());
        await this.loadComponent(false);
        return;
      });
  }

  async loadComponent(success) {
    const path = success ? 'check-complete' : 'submission-failed';
    return this.router.navigate([`/${path}`]);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
