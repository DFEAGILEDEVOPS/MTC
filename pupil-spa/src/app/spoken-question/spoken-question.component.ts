import { Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionRendered } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { StorageService } from '../services/storage/storage.service';
import { SpeechService } from '../services/speech/speech.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { Subscription } from 'rxjs/Subscription';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-spoken-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenQuestionComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService,
              protected zone: NgZone,
              protected storageService: StorageService,
              protected speechService: SpeechService,
              protected questionService: QuestionService) {
    super(auditService, windowRefService, registerInputService, questionService, storageService, speechService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;

    // Add attributes to the <body> tag to reflect the current question
    const bodyTag = <Element>window.document[ 'body' ];
    bodyTag.setAttribute('data-sequence-number', this.sequenceNumber.toString());
    bodyTag.setAttribute('data-factor1', this.factor1.toString());
    bodyTag.setAttribute('data-factor2', this.factor2.toString());

    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (!this.timeout && speechStatus === SpeechService.questionSpeechEnded) {
          // console.log('SpokenQuestionComponent: Starting the timer');
          this.startTimer();
        }
      });
    });
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    this.auditService.addEntry(new QuestionRendered({
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.speechService.speakQuestion(`${this.factor1} times ${this.factor2}?`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    // Remove attributes from the <body> tag to reflect the current lack of a question
    const bodyTag = <Element>window.document[ 'body' ];
    bodyTag.removeAttribute('data-sequence-number');
    bodyTag.removeAttribute('data-factor1');
    bodyTag.removeAttribute('data-factor2');
  }
}
