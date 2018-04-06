import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PracticeQuestionComponent } from '../practice-question/practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionRendered } from '../services/audit/auditEntry';

@Component({
  selector: 'app-spoken-practice-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenPracticeQuestionComponent extends PracticeQuestionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription;

  /**
   * Reference to the Sound component
   */
  @Input() public soundComponent;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected speechService: SpeechService,
              protected zone: NgZone) {
    super(auditService, windowRefService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (speechStatus === SpeechService.speechEnded) {
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
    this.speechService.speak(`${this.factor1} times ${this.factor2}?`);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Start the countdown timer on the page and set the time-out counter
   */
  startTimer() {
    let alertPlayed = false;
    this.stopTime = (new Date().getTime() + (this.questionTimeoutSecs * 1000));

    // Set the amount of time the user can have on the question
    this.timeout = this.window.setTimeout(() => {
      this.soundComponent.playEndOfQuestionSound();
      this.sendTimeoutEvent();
    }, this.questionTimeoutSecs * 1000);

    // Set the countdown timer on the page
    this.countdownInterval = this.window.setInterval(() => {
      let timeLeft = (this.stopTime - (new Date().getTime())) / 1000;
      if (timeLeft < 0) {
        clearInterval(this.countdownInterval);
        timeLeft = 0;
      }
      this.remainingTime = Math.ceil(timeLeft);
      if (this.remainingTime === 2 && !alertPlayed) {
        this.soundComponent.playTimeRunningOutAlertSound();
        alertPlayed = true;
      }
    }, 100);
  }
}
