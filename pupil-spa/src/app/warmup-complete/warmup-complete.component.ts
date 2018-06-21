import { Component, OnInit, Output, EventEmitter, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';

import { AuditService } from '../services/audit/audit.service';
import { WarmupCompleteRendered } from '../services/audit/auditEntry';
import { SubmissionService } from '../services/submission/submission.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-warmup-complete',
  templateUrl: './warmup-complete.component.html',
  styles: []
})
export class WarmupCompleteComponent implements OnInit, AfterViewInit, OnDestroy {
  private speechListenerEvent: any;

  /**
   * Emit a click event when the user clicks the button
   * @type {EventEmitter<any>}
   */
  @Output()
  clickEvent: EventEmitter<any> = new EventEmitter();

  public count: number;

  constructor(
    private auditService: AuditService,
    private submissionService: SubmissionService,
    private questionService: QuestionService,
    private speechService: SpeechService,
    private elRef: ElementRef
  ) {
    this.count = this.questionService.getNumberOfQuestions();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.auditService.addEntry(new WarmupCompleteRendered());

    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus', (event) => {
        this.speechService.speakFocusedElement(event.target);
      }, true);
    }
  }

  async onClick() {
    this.clickEvent.emit(null);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
