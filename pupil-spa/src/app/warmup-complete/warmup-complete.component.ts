import { Component, OnInit, Output, EventEmitter, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { WarmupCompleteRendered,
  CheckStartedApiCalled,
  CheckStartedAPICallSucceeded,
  CheckStarted } from '../services/audit/auditEntry';
import { SubmissionService } from '../services/submission/submission.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private auditService: AuditService,
    private submissionService: SubmissionService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupCompleteRendered());

    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);
    }
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

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();
    }
  }
}
