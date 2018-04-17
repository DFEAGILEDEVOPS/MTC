import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionRendered } from '../services/audit/auditEntry';
import { QuestionService } from '../services/question/question.service';

@Component({
  selector: 'app-spoken-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenPracticeQuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  /**
   * Set to true after the audible alert has played to indicate the end of the question time is near.
   * @type {boolean}
   */
  private hasAudibleAlertPlayed = false;

  /**
   * Reference to the Sound component
   */
  @Input() public soundComponent;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected speechService: SpeechService,
              protected zone: NgZone,
              protected questionService: QuestionService) {
    super(auditService, windowRefService, questionService, speechService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (!this.timeout && speechStatus === SpeechService.questionSpeechEnded) {
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
      practiseSequenceNumber: this.sequenceNumber,
      question: `${this.factor1}x${this.factor2}`
    }));
    this.speechService.speakQuestion(`${this.factor1} times ${this.factor2}?`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Hook that runs before the timeout event (sent when the timer reaches 0 seconds)
   */
  preSendTimeoutEvent() {
    this.soundComponent.playEndOfQuestionSound();
  }

  /**
   * Hook that is called each time the countdown timer is called.  Roughly every 100 ms.
   * @param remainingTime
   */
  countdownIntervalHook(remainingTime) {
    if (remainingTime === 2 && !this.hasAudibleAlertPlayed) {
      this.soundComponent.playTimeRunningOutAlertSound();
      this.hasAudibleAlertPlayed = true;
    }
  }
}
