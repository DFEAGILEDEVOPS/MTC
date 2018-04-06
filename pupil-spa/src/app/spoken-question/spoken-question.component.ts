import { Component, OnInit, AfterViewInit, NgZone, OnDestroy, Input } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { QuestionComponent } from '../question/question.component';
import { QuestionRendered } from '../services/audit/auditEntry';
import { RegisterInputService } from '../services/register-input/registerInput.service';
import { SpeechService } from '../services/speech/speech.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-spoken-question',
  templateUrl: '../question/question.component.html',
  styleUrls: ['../question/question.component.css'],
})
export class SpokenQuestionComponent extends QuestionComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscription: Subscription;

  /**
   * Reference to the Sound component
   */
  @Input() public soundComponent;

  constructor(protected auditService: AuditService,
              protected windowRefService: WindowRefService,
              protected registerInputService: RegisterInputService,
              protected zone: NgZone,
              protected speechService: SpeechService) {
    super(auditService, windowRefService, registerInputService);
  }

  ngOnInit() {
    this.remainingTime = this.questionTimeoutSecs;
    this.subscription = this.speechService.speechStatus.subscribe(speechStatus => {
      this.zone.run(() => {
        if (speechStatus === SpeechService.speechEnded) {
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
