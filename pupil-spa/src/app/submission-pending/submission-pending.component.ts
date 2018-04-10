import { Component, EventEmitter, OnInit, Output, ElementRef } from '@angular/core';
import { environment } from '../../environments/environment';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditService } from '../services/audit/audit.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CheckSubmissionApiCalled, CheckSubmissionAPICallSucceeded } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

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
              private route: ActivatedRoute,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
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

  ngAfterViewInit() {
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    this.speechService.cancel();
  }
}
