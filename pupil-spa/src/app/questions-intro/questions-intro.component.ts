import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import {
  QuestionIntroRendered,
  CheckStartedApiCalled,
  CheckStartedAPICallSucceeded,
  CheckStarted,
} from '../services/audit/auditEntry';
import { SubmissionService } from '../services/submission/submission.service';
import { AuditService } from '../services/audit/audit.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-questions-intro',
  templateUrl: './questions-intro.component.html',
  styleUrls: ['./questions-intro.component.scss']
})
export class QuestionsIntroComponent implements OnInit, AfterViewInit, OnDestroy {

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
    this.auditService.addEntry(new QuestionIntroRendered());

    if (this.questionService.getConfig().speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus', (event) => {
        this.speechService.speakFocusedElement(event.target);
      }, true);
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

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }

}
