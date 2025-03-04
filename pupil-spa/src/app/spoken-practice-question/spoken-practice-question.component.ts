import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';

import { AnswerService } from '../services/answer/answer.service';
import { AuditService } from '../services/audit/audit.service';
import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditEntryFactory } from '../services/audit/auditEntry'
import { QuestionService } from '../services/question/question.service';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';

@Component({
    selector: 'app-spoken-practice-question',
    templateUrl: '../question/question.component.html',
    styleUrls: ['../question/question.component.css'],
    standalone: false
})
export class SpokenPracticeQuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  /**
   * Do not show 'practice' label on top left.
   */
  public isWarmUpQuestion = true;


  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected speechService: SpeechService,
              protected zone: NgZone,
              protected storageService: StorageService,
              protected questionService: QuestionService,
              protected answerService: AnswerService,
              protected registerInputService: RegisterInputService,
              protected renderer: Renderer2,
              protected auditEntryFactory: AuditEntryFactory) {
    super(auditService, windowRefService, questionService, storageService, speechService, answerService, registerInputService, renderer, auditEntryFactory);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.shouldShowQuestion = false;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (!this.timeout && speechStatus === SpeechService.questionSpeechEnded) {
          this.startTimer();
          this.shouldShowQuestion = true;
        }
      });
    });
  }

  /**
   * Start the timer when the view is ready.
   */
  ngAfterViewInit() {
    const data = {
      sequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`,
      isWarmup: this.isWarmUpQuestion
    }
    this.auditService.addEntry(this.auditEntryFactory.createQuestionRendered(data));

    // Set up listening events depending on the browser's capability
    if (this.shouldSetupPointerEvents()) {
      this.setupKeypadEventListeners('pointerup');
    } else {
      this.setupKeypadEventListeners('click');
    }

    this.speechService.speakQuestion(`${this.factor1} times ${this.factor2}?`, this.sequenceNumber);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    // clear both timeout and intervals
    if (this.countdownInterval !== undefined) {
      clearInterval( this.countdownInterval )
    }
    if (this.timeout !== undefined) {
      clearTimeout( this.timeout )
    }

    if (this.cleanUpFunctions.length > 0) {
      this.cleanUpFunctions.forEach(f => f());
    }
  }
}
